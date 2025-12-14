import { z } from 'zod';
import { router, procedure } from '../trpc';
import { getGameBySteamId, searchSteam } from '@/server/helpers/steam';
import { TRPCError } from '@trpc/server';
import {
  ChipsetEnum,
  ChipsetVariantEnum,
  PerformanceEnum,
  PlayMethodEnum,
  type ChipsetVariant,
  type PlayMethod,
} from '@/server/schema';
import { calculateTranslationLayerStats } from '@/server/utils/calculateTranslationLayerStats';
import { calculateAveragePerformance } from '@/server/utils/calculateAveragePerformance';
import { getViewSignedUrl, extractKeyFromUrl } from '@/lib/s3';

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

      let queryChipset: string | undefined;
      let queryChipsetVariant: ChipsetVariant | undefined;
      let queryPlayMethod: PlayMethod | undefined;

      if (chipset) {
        queryChipset = chipset;
        queryChipsetVariant = chipsetVariant; 
      } else {
        queryChipset = 'ALL';
        queryChipsetVariant = 'BASE' as ChipsetVariant; 
      }

      if (playMethod === 'ALL') {
        queryPlayMethod = 'OTHER' as PlayMethod;
      } else {
        queryPlayMethod = playMethod as PlayMethod;
      }

      const performanceStats = await ctx.prisma!.performanceStats.findMany({
        where: {
          chipset: queryChipset,
          chipsetVariant: queryChipsetVariant,
          playMethod: queryPlayMethod,
        },
      });

      const ratingCounts = performanceStats.reduce(
        (acc, stat) => {
          acc.ALL += stat.count;
          acc[stat.performanceRating as keyof typeof acc] += stat.count;
          return acc;
        },
        {
          ALL: 0,
          EXCELLENT: 0,
          GOOD: 0,
          PLAYABLE: 0,
          BARELY_PLAYABLE: 0,
          UNPLAYABLE: 0,
          VERY_GOOD: 0,
        },
      );

      return ratingCounts;
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

        const canUsePerformanceStats = chipset || playMethod !== 'ALL';

        if (canUsePerformanceStats && performance !== 'ALL') {
          const gamesForIds = await ctx.prisma!.game.findMany({
            where: {
              aggregatedPerformance: performance,

              ...((chipset || playMethod !== 'ALL') && {
                reviews: {
                  some: {
                    ...(chipset && { chipset }),
                    ...(chipset && chipsetVariant && { chipsetVariant }),
                    ...(playMethod !== 'ALL' && { playMethod }),
                  },
                },
              }),
            },
            select: { id: true },
            orderBy: { reviewCount: 'desc' },
            skip: offset,
            take: limit * 3,
          });

          const gameIds = gamesForIds.map((game: { id: string }) => game.id);

          if (gameIds.length === 0) {
            return {
              games: [],
              hasNextPage: false,
              nextOffset: undefined,
            };
          }

          const games = await ctx.prisma!.game.findMany({
            where: {
              id: { in: gameIds },
              aggregatedPerformance: { not: null },
            },
            orderBy: {
              reviewCount: 'desc',
            },
            take: limit + 1,
          });

          const gamesWithPerformance = games
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

        const games = await ctx.prisma!.game.findMany({
          where: {
            ...(performance !== 'ALL' && {
              aggregatedPerformance: performance,
            }),

            ...(playMethod !== 'ALL' && {
              reviews: {
                some: {
                  playMethod,
                },
              },
            }),

            ...(chipset && {
              reviews: {
                some: {
                  chipset,
                  ...(chipsetVariant && { chipsetVariant }),
                },
              },
            }),
          },
          skip: offset,
          take: limit + 1,
          orderBy: {
            reviewCount: 'desc', 
          },
        });

        const gamesWithPerformance = games
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
        const reviews = await ctx.prisma!.gameReview.findMany({
          where: { gameId: input.id },
          include: {
            macConfig: true,
          },
        });

        const game = await ctx.prisma!.game.findUnique({
          where: { id: input.id },
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

          await ctx.prisma!.game.upsert({
            where: { id: input.id },
            update: { details: gameDetails }, 
            create: { id: input.id, details: gameDetails }, 
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
