import { z } from 'zod';
import { router, procedure } from '../trpc';
import { type SteamAppData } from '../api/steam';
import { getIGDBGameById, getSteamAppIdFromIGDB } from '../api/igdb';
import { getOrCreateSteamGame } from '../utils/getOrCreateSteamGame';
import { searchGames } from '../gameSources/searchGames';
import { generateUniqueGameSlug } from '../utils/generateUniqueGameSlug';
import { getGamePrices } from '../api/ggdeals';
import { getRegion } from '../utils/getRegion';
import { TRPCError } from '@trpc/server';
import {
  CHIPSET_VARIANTS,
  ChipsetEnum,
  ChipsetVariantEnum,
  PerformanceEnum,
  PlayMethodEnum,
} from '../schema';
import {
  CoverArtSchema,
  GameByIdSchema,
  GamePricesSchema,
  GamesPageSchema,
  GameSearchResultSchema,
  RatingCountsSchema,
  MaterializeFromIgdbResultSchema,
} from '../schema/openapi';

// Validated in the handler (not via .superRefine) so the input stays a plain
// ZodObject — trpc-to-openapi requires that for GET query parameters.
const assertValidChipsetVariant = (val: {
  chipset?: z.infer<typeof ChipsetEnum>;
  chipsetVariant?: z.infer<typeof ChipsetVariantEnum>;
}) => {
  if (val.chipset && val.chipsetVariant && !CHIPSET_VARIANTS[val.chipset].includes(val.chipsetVariant)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `${val.chipset} has no ${val.chipsetVariant} variant`,
    });
  }
};
import { calculateTranslationLayerStats } from '../utils/calculateTranslationLayerStats';
import { calculateAveragePerformance } from '../utils/calculateAveragePerformance';
import { getViewSignedUrl, extractKeyFromUrl } from '../services/s3';
import { type DrizzleDB } from '../database/drizzle';
import { games, gameReviews, gameAliases, type PerformanceRating, type PlayMethod, type ChipsetVariant } from '../drizzle/schema';
import { eq, and, desc, count, isNotNull, inArray, type SQL } from 'drizzle-orm';

type RatingCounts = Record<PerformanceRating | 'ALL', number>;

function createEmptyCounts(): RatingCounts {
  return {
    ALL: 0,
    EXCELLENT: 0,
    VERY_GOOD: 0,
    GOOD: 0,
    PLAYABLE: 0,
    BARELY_PLAYABLE: 0,
    UNPLAYABLE: 0,
  };
}

async function getUnfilteredCounts(
  db: DrizzleDB,
): Promise<RatingCounts> {
  const counts = await db
    .select({
      aggregatedPerformance: games.aggregatedPerformance,
      count: count(),
    })
    .from(games)
    .where(isNotNull(games.aggregatedPerformance))
    .groupBy(games.aggregatedPerformance);

  const result = createEmptyCounts();
  for (const row of counts) {
    if (row.aggregatedPerformance) {
      result[row.aggregatedPerformance] = row.count;
      result.ALL += row.count;
    }
  }
  return result;
}

async function getFilteredCounts(
  db: DrizzleDB,
  reviewFilter: { chipset?: string; chipsetVariant?: ChipsetVariant; playMethod?: PlayMethod },
): Promise<RatingCounts> {
  const conditions: SQL[] = [];
  if (reviewFilter.chipset) conditions.push(eq(gameReviews.chipset, reviewFilter.chipset));
  if (reviewFilter.chipsetVariant) conditions.push(eq(gameReviews.chipsetVariant, reviewFilter.chipsetVariant));
  if (reviewFilter.playMethod) conditions.push(eq(gameReviews.playMethod, reviewFilter.playMethod));

  const pairs = await db
    .select({
      gameId: gameReviews.gameId,
      performance: gameReviews.performance,
    })
    .from(gameReviews)
    .where(and(...conditions));

  const result = createEmptyCounts();
  const seen = new Map<PerformanceRating, Set<string>>();

  for (const { gameId, performance } of pairs) {
    if (!seen.has(performance)) {
      seen.set(performance, new Set());
    }
    seen.get(performance)!.add(gameId);
  }

  for (const [rating, gameIds] of seen) {
    result[rating] = gameIds.size;
    result.ALL += gameIds.size;
  }
  return result;
}

export const gameRouter = router({
  search: procedure
    .meta({ openapi: { method: 'GET', path: '/games/search', protect: false, tags: ['games'] } })
    .input(z.object({ query: z.string() }))
    .output(z.array(GameSearchResultSchema))
    .query(async ({ input, ctx }) => searchGames(ctx.db, input.query)),

  getOrCreateFromIGDB: procedure
    .meta({ openapi: { method: 'POST', path: '/games/from-igdb', protect: false, tags: ['games'] } })
    .input(z.object({ igdbId: z.number().int().positive() }))
    .output(MaterializeFromIgdbResultSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const existing = await ctx.db.query.games.findFirst({
          where: eq(games.igdbId, input.igdbId),
        });
        if (existing) {
          return { id: existing.id, slug: existing.slug };
        }

        const igdbGame = await getIGDBGameById(input.igdbId);
        if (!igdbGame) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Game not found on IGDB',
          });
        }

        const steamAppId = getSteamAppIdFromIGDB(igdbGame);
        if (steamAppId) {
          const steamGame = await getOrCreateSteamGame(ctx.db, steamAppId);
          if (steamGame) {
            return { id: steamGame.id, slug: steamGame.slug };
          }
        }

        const releaseYear = igdbGame.first_release_date
          ? new Date(igdbGame.first_release_date * 1000).getUTCFullYear()
          : undefined;

        const isTaken = async (candidate: string): Promise<boolean> => {
          const [row] = await ctx.db
            .select({ id: games.id })
            .from(games)
            .where(eq(games.slug, candidate))
            .limit(1);
          return row !== undefined;
        };

        const slug = await generateUniqueGameSlug(igdbGame.name, {
          releaseYear,
          fallbackId: String(input.igdbId),
          isTaken,
        });

        const id = `igdb-${input.igdbId}`;

        await ctx.db
          .insert(games)
          .values({
            id,
            slug,
            details: JSON.stringify(igdbGame),
            source: 'igdb',
            igdbId: input.igdbId,
          })
          .onConflictDoNothing();

        const persisted = await ctx.db.query.games.findFirst({
          where: eq(games.igdbId, input.igdbId),
        });

        return persisted
          ? { id: persisted.id, slug: persisted.slug }
          : { id, slug };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error(
          `Error materializing IGDB game ${input.igdbId}:`,
          error,
        );
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to materialize game from IGDB',
        });
      }
    }),

  getCoverArt: procedure
    .meta({ openapi: { method: 'GET', path: '/games/{gameId}/cover-art', protect: false, tags: ['games'] } })
    .input(z.object({ gameId: z.string() }))
    .output(CoverArtSchema)
    .query(async ({ input, ctx }) => {
      try {
        const game = await getOrCreateSteamGame(ctx.db, input.gameId);
        const gameData = game?.details
          ? (JSON.parse(game.details) as SteamAppData)
          : null;

        if (!gameData || !gameData.header_image) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cover art not found for this game',
          });
        }

        return {
          headerImage: gameData.header_image,
          capsuleImage: gameData.capsule_image,
          capsuleImagev5: gameData.capsule_imagev5,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching cover art:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch cover art from Steam API',
        });
      }
    }),

  getFilterCounts: procedure
    .meta({ openapi: { method: 'GET', path: '/games/filter-counts', protect: false, tags: ['games'] } })
    .input(
      z.object({
        chipset: ChipsetEnum.optional(),
        chipsetVariant: ChipsetVariantEnum.optional(),
        playMethod: z.enum(['ALL', ...PlayMethodEnum.options]).default('ALL'),
      }),
    )
    .output(RatingCountsSchema)
    .query(async ({ input, ctx }) => {
      assertValidChipsetVariant(input);
      const { chipset, chipsetVariant, playMethod } = input;

      const reviewFilter = {
        ...(chipset && { chipset }),
        ...(chipset && chipsetVariant && { chipsetVariant }),
        ...(playMethod !== 'ALL' && { playMethod }),
      };

      const hasFilters = Object.keys(reviewFilter).length > 0;

      if (hasFilters) {
        return getFilteredCounts(ctx.db, reviewFilter);
      }

      return getUnfilteredCounts(ctx.db);
    }),

  getGames: procedure
    .meta({ openapi: { method: 'GET', path: '/games', protect: false, tags: ['games'] } })
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(6),
        cursor: z.number().min(0).default(0),
        performance: z.enum(['ALL', ...PerformanceEnum.options]).default('ALL'),
        chipset: ChipsetEnum.optional(),
        chipsetVariant: ChipsetVariantEnum.optional(),
        playMethod: z.enum(['ALL', ...PlayMethodEnum.options]).default('ALL'),
      }),
    )
    .output(GamesPageSchema)
    .query(async ({ input, ctx }) => {
      assertValidChipsetVariant(input);
      try {
        const {
          limit,
          cursor: offset,
          performance,
          chipset,
          chipsetVariant,
          playMethod,
        } = input;

        const hasChipsetOrPlayMethodFilter = chipset || playMethod !== 'ALL';

        if (hasChipsetOrPlayMethodFilter) {
          // Build review filter conditions for subquery
          const reviewConditions: SQL[] = [];
          if (performance !== 'ALL') reviewConditions.push(eq(gameReviews.performance, performance));
          if (chipset) reviewConditions.push(eq(gameReviews.chipset, chipset));
          if (chipset && chipsetVariant) reviewConditions.push(eq(gameReviews.chipsetVariant, chipsetVariant));
          if (playMethod !== 'ALL') reviewConditions.push(eq(gameReviews.playMethod, playMethod));

          // Get game IDs matching the review filters
          const matchingGameIds = ctx.db
            .selectDistinct({ gameId: gameReviews.gameId })
            .from(gameReviews)
            .where(and(...reviewConditions));

          const gamesForIds = await ctx.db
            .select({ id: games.id })
            .from(games)
            .where(inArray(games.id, matchingGameIds))
            .orderBy(desc(games.reviewCount))
            .offset(offset)
            .limit(limit * 3);

          const gameIds = gamesForIds.map((game) => game.id);

          if (gameIds.length === 0) {
            return {
              games: [],
              hasNextPage: false,
              nextOffset: undefined,
            };
          }

          const matchedGames = await ctx.db
            .select()
            .from(games)
            .where(and(
              inArray(games.id, gameIds),
              isNotNull(games.aggregatedPerformance),
            ))
            .orderBy(desc(games.reviewCount))
            .limit(limit + 1);

          const gamesWithPerformance = matchedGames
            .filter(
              (
                game,
              ): game is typeof game & {
                aggregatedPerformance: NonNullable<
                  typeof game.aggregatedPerformance
                >;
              } => game.aggregatedPerformance !== null,
            )
            .map((game) => ({
              id: game.id,
              slug: game.slug,
              source: game.source,
              details: game.details,
              performanceRating: game.aggregatedPerformance,
            }));

          const hasNextPage = gamesWithPerformance.length > limit;
          const gamesToReturn = hasNextPage
            ? gamesWithPerformance.slice(0, limit)
            : gamesWithPerformance;

          return {
            games: gamesToReturn,
            hasNextPage,
            nextOffset: hasNextPage ? offset + limit : undefined,
          };
        }

        // No chipset or playMethod filters - simple query on aggregatedPerformance
        const conditions: SQL[] = [];
        if (performance !== 'ALL') {
          conditions.push(eq(games.aggregatedPerformance, performance));
        }

        const matchedGames = await ctx.db
          .select()
          .from(games)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(games.reviewCount))
          .offset(offset)
          .limit(limit + 1);

        const gamesWithPerformance = matchedGames
          .filter(
            (
              game,
            ): game is typeof game & {
              aggregatedPerformance: NonNullable<
                typeof game.aggregatedPerformance
              >;
            } => game.aggregatedPerformance !== null,
          )
          .map((game) => ({
            id: game.id,
            slug: game.slug,
            source: game.source,
            details: game.details,
            performanceRating: game.aggregatedPerformance,
          }));

        const hasNextPage = gamesWithPerformance.length > limit;
        const gamesToReturn = hasNextPage
          ? gamesWithPerformance.slice(0, limit)
          : gamesWithPerformance;

        return {
          games: gamesToReturn,
          hasNextPage,
          nextOffset: hasNextPage ? offset + limit : undefined,
        };
      } catch (error) {
        console.error('Error fetching games:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch games',
        });
      }
    }),

  getById: procedure
    .meta({ openapi: { method: 'GET', path: '/games/{id}', protect: false, tags: ['games'] } })
    .input(z.object({ id: z.string() }))
    .output(GameByIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        let game = await ctx.db.query.games.findFirst({
          where: eq(games.slug, input.id),
        });

        if (!game) {
          game = await ctx.db.query.games.findFirst({
            where: eq(games.id, input.id),
          });
        }

        if (!game) {
          const alias = await ctx.db.query.gameAliases.findFirst({
            where: eq(gameAliases.aliasId, input.id),
          });
          if (alias) {
            game = await ctx.db.query.games.findFirst({
              where: eq(games.id, alias.canonicalId),
            });
          }
        }

        const isNumericId = /^[0-9]+$/.test(input.id);

        if ((!game || !game.details) && isNumericId) {
          const steamAppId = game?.id ?? input.id;
          const created = await getOrCreateSteamGame(ctx.db, steamAppId);
          if (created) {
            game = created;
          }
        }

        if (!game || !game.details) {
          console.warn(`Game with ID ${input.id} could not be resolved.`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Game not found',
          });
        }

        const gameDetails: string = game.details;

        const reviews = await ctx.db.query.gameReviews.findMany({
          where: eq(gameReviews.gameId, game.id),
          with: {
            macConfig: true,
          },
        });

        const reviewStats =
          reviews.length > 0
            ? {
                totalReviews: reviews.length,
                methods: {
                  native: reviews.filter((r) => r.playMethod === 'NATIVE')
                    .length,
                  crossover: reviews.filter((r) => r.playMethod === 'CROSSOVER')
                    .length,
                  parallels: reviews.filter((r) => r.playMethod === 'PARALLELS')
                    .length,
                  other: reviews.filter((r) => r.playMethod === 'OTHER').length,
                },
                averagePerformance: calculateAveragePerformance(reviews),
                translationLayers: calculateTranslationLayerStats(reviews),
              }
            : null;

        return {
          game: {
            ...game,
            details: gameDetails,
          },
          reviews,
          stats: reviewStats,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error(`Error fetching game details for ID ${input.id}:`, error);
        throw new Error('Failed to fetch game details');
      }
    }),

  getScreenshotSignedUrls: procedure
    .meta({ openapi: { method: 'GET', path: '/screenshots/signed-urls', protect: false, tags: ['games'] } })
    .input(
      z.object({
        // REST query params arrive as a comma-separated string
        screenshots: z.preprocess(
          (value) => (typeof value === 'string' ? value.split(',') : value),
          z.array(z.string()),
        ),
      }),
    )
    .output(z.array(z.object({ original: z.string(), signed: z.string() })))
    .query(async ({ input }) => {
      try {
        const signedUrls = await Promise.all(
          input.screenshots.map(async (url) => {
            const key = extractKeyFromUrl(url);
            if (!key) {
              console.warn(`Could not extract key from URL: ${url}`);
              return { original: url, signed: url };
            }

            try {
              const signedUrl = await getViewSignedUrl(key, 3600);
              return { original: url, signed: signedUrl };
            } catch (error) {
              console.warn(
                `Could not generate signed URL for key: ${key}`,
                error,
              );
              return { original: url, signed: url };
            }
          }),
        );

        return signedUrls;
      } catch (error) {
        console.error('Error generating signed URLs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate signed URLs for screenshots',
        });
      }
    }),

  getPrices: procedure
    .meta({ openapi: { method: 'GET', path: '/games/{gameId}/prices', protect: false, tags: ['games'] } })
    .input(z.object({ gameId: z.string() }))
    .output(GamePricesSchema)
    .query(async ({ input, ctx }) => {
      try {
        const region = ctx.req ? getRegion(ctx.req.headers) : 'us';
        const data = await getGamePrices(input.gameId, region);
        return data ?? null;
      } catch {
        return null;
      }
    }),
});
