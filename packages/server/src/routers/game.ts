import { z } from 'zod';
import { router, procedure } from '../trpc';
import { getGameBySteamId, searchSteam } from '../api/steam';
import { TRPCError } from '@trpc/server';
import {
  ChipsetEnum,
  ChipsetVariantEnum,
  PerformanceEnum,
  PlayMethodEnum,
} from '../schema';
import { calculateTranslationLayerStats } from '../utils/calculateTranslationLayerStats';
import { calculateAveragePerformance } from '../utils/calculateAveragePerformance';
import { getViewSignedUrl, extractKeyFromUrl } from '../services/s3';
import { type DrizzleDB } from '../database/drizzle';
import { games, gameReviews, type PerformanceRating, type PlayMethod, type ChipsetVariant } from '../drizzle/schema';
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
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      try {
        const results = await searchSteam(input.query);
        return results.slice(0, 10);
      } catch (error) {
        console.error('Search error:', error);
        throw new Error('Failed to search games');
      }
    }),

  getCoverArt: procedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      try {
        const gameData = await getGameBySteamId(input.gameId);

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
        console.error('Error fetching cover art:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch cover art from Steam API',
        });
      }
    }),

  getFilterCounts: procedure
    .input(
      z.object({
        chipset: ChipsetEnum.optional(),
        chipsetVariant: ChipsetVariantEnum.optional(),
        playMethod: z.enum(['ALL', ...PlayMethodEnum.options]).default('ALL'),
      }),
    )
    .query(async ({ input, ctx }) => {
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
    .query(async ({ input, ctx }) => {
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
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const reviews = await ctx.db.query.gameReviews.findMany({
          where: eq(gameReviews.gameId, input.id),
          with: {
            macConfig: true,
          },
        });

        const game = await ctx.db.query.games.findFirst({
          where: eq(games.id, input.id),
        });

        let gameDetails: string = game?.details as string;

        if (!game || !game.details) {
          const response = await getGameBySteamId(input.id);
          if (!response) {
            console.warn(`Game with ID ${input.id} not found on Steam.`);
            throw new TRPCError({
              message: 'Something went wrong',
              code: 'INTERNAL_SERVER_ERROR',
            });
          }

          gameDetails = JSON.stringify(response);

          await ctx.db
            .insert(games)
            .values({ id: input.id, details: gameDetails })
            .onConflictDoUpdate({
              target: games.id,
              set: { details: gameDetails },
            });
        }

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
        console.error(`Error fetching game details for ID ${input.id}:`, error);
        throw new Error('Failed to fetch game details');
      }
    }),

  getScreenshotSignedUrls: procedure
    .input(
      z.object({
        screenshots: z.array(z.string()),
      }),
    )
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
});
