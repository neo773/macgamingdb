import { z } from "zod";
import { router, procedure } from "../trpc";
import { getGameBySteamId, searchSteam } from "@/server/helpers/steam";
import { TRPCError } from "@trpc/server";
import { PerformanceRating } from "@prisma/client";
import { ChipsetEnum, ChipsetVariantEnum, PerformanceEnum, PlayMethodEnum } from "../schema";
import { calculateAveragePerformance, calculateTranslationLayerStats } from "../utils";

export const gameRouter = router({
  search: procedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      try {
        const results = await searchSteam(input.query);
        return results.slice(0, 10);
      } catch (error) {
        console.error("Search error:", error);
        throw new Error("Failed to search games");
      }
    }),

  getGames: procedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(6),
        cursor: z.string().nullish(),
        filter: z.enum(['ALL', ...PerformanceEnum.options]).default('ALL'),
        chipset: ChipsetEnum.optional(),
        chipsetVariant: ChipsetVariantEnum.optional(),
        playMethod: z.enum(['ALL', ...PlayMethodEnum.options]).default('ALL'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { limit, cursor, filter, chipset, chipsetVariant, playMethod } = input;

        return await ctx.prisma!.$transaction(async (tx) => {
          // Step 1: Get aggregated review counts per game (minimal row reads)
          const gameReviewCounts = await tx.gameReview.groupBy({
            by: ['gameId'],
            where: {
              ...(chipset ? { chipset } : {}),
              ...(chipsetVariant ? { chipsetVariant } : {}),
              ...(playMethod !== 'ALL' ? { playMethod } : {}),
            },
            _count: {
              gameId: true,
            },
          });

          // Sort by count manually since groupBy orderBy is complex
          gameReviewCounts.sort((a, b) => b._count.gameId - a._count.gameId);

          if (gameReviewCounts.length === 0) {
            return {
              games: [],
              nextCursor: undefined,
              totalCount: 0,
              ratingCounts: {
                ALL: 0,
                EXCELLENT: 0,
                GOOD: 0,
                PLAYABLE: 0,
                BARELY_PLAYABLE: 0,
                UNPLAYABLE: 0,
              },
            };
          }

          // Step 2: Get performance data only for games with reviews (still minimal reads)
          const gameIds = gameReviewCounts.map(g => g.gameId);
          const performanceData = await tx.gameReview.findMany({
            select: {
              gameId: true,
              performance: true,
            },
            where: {
              gameId: { in: gameIds },
              ...(chipset ? { chipset } : {}),
              ...(chipsetVariant ? { chipsetVariant } : {}),
              ...(playMethod !== 'ALL' ? { playMethod } : {}),
            },
          });

          // Step 3: Calculate performance ratings efficiently
          const perfValueMap: Record<PerformanceRating, number> = {
            UNPLAYABLE: 0,
            BARELY_PLAYABLE: 1,
            PLAYABLE: 2,
            GOOD: 3,
            EXCELLENT: 4,
          };

          const ratingThresholds = {
            EXCELLENT: 3.5,
            GOOD: 2.5,
            PLAYABLE: 1.5,
            BARELY_PLAYABLE: 0.5,
          };

          const ratingCounts: Record<PerformanceRating | 'ALL', number> = {
            ALL: 0,
            EXCELLENT: 0,
            GOOD: 0,
            PLAYABLE: 0,
            BARELY_PLAYABLE: 0,
            UNPLAYABLE: 0,
          };

          // Group performance by game
          const gamePerformanceMap = new Map<string, number[]>();
          performanceData.forEach(({ gameId, performance }) => {
            if (!gamePerformanceMap.has(gameId)) {
              gamePerformanceMap.set(gameId, []);
            }
            gamePerformanceMap.get(gameId)!.push(perfValueMap[performance]);
          });

          // Calculate final game performances with review counts
          const gamePerformances = gameReviewCounts.map(({ gameId, _count }) => {
            const performanceValues = gamePerformanceMap.get(gameId) || [0];
            const avgPerformance = performanceValues.reduce((sum, val) => sum + val, 0) / performanceValues.length;
            
            let rating: PerformanceRating;
            if (avgPerformance >= ratingThresholds.EXCELLENT) rating = 'EXCELLENT';
            else if (avgPerformance >= ratingThresholds.GOOD) rating = 'GOOD';
            else if (avgPerformance >= ratingThresholds.PLAYABLE) rating = 'PLAYABLE';
            else if (avgPerformance >= ratingThresholds.BARELY_PLAYABLE) rating = 'BARELY_PLAYABLE';
            else rating = 'UNPLAYABLE';

            ratingCounts[rating]++;
            ratingCounts.ALL++;

            return {
              gameId,
              count: _count.gameId,
              avgPerformance,
              rating,
            };
          });

          // Filter by performance rating
          const filteredGames = filter === 'ALL' 
            ? gamePerformances
            : gamePerformances.filter(game => game.rating === filter);

          // Handle pagination
          const startIndex = cursor 
            ? filteredGames.findIndex(game => game.gameId === cursor) + 1 
            : 0;
          
          const paginatedGames = filteredGames.slice(startIndex, startIndex + limit + 1);
          const paginatedGameIds = paginatedGames.map(g => g.gameId);

          // Only fetch game details for the paginated results
          const games = paginatedGameIds.length > 0 
            ? await tx.game.findMany({
                where: { id: { in: paginatedGameIds } }
              })
            : [];

          // Create maps for efficient lookups
          const gameMap = new Map(games.map(game => [game.id, game]));
          const perfInfoMap = new Map(paginatedGames.map(g => [g.gameId, { 
            rating: g.rating, 
            count: g.count 
          }]));

          // Order games correctly and handle pagination
          const sortedGames = paginatedGameIds
            .map(id => gameMap.get(id))
            .filter(Boolean) as typeof games;

          let nextCursor: typeof cursor = undefined;
          if (sortedGames.length > limit) {
            const nextItem = sortedGames.pop();
            nextCursor = nextItem!.id;
          }

          // Map games with performance data
          const gamesWithPerformance = sortedGames.map(game => {
            const perf = perfInfoMap.get(game.id);
            return {
              ...game,
              performanceRating: perf?.rating || 'PLAYABLE',
              reviewCount: perf?.count || 0,
            };
          });

          return {
            games: gamesWithPerformance,
            nextCursor,
            totalCount: filteredGames.length,
            ratingCounts,
          };
        });
      } catch (error) {
        console.error("Error fetching games:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch games",
        });
      }
    }),

  getById: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        // Get reviews from our database
        const reviews = await ctx.prisma!.gameReview.findMany({
          where: { gameId: input.id },
        });

        const game = await ctx.prisma!.game.findUnique({
          where: { id: input.id },
        });

        let gameDetails: string = game?.details as string;
        // if game doesn't exist fetch from steam API
        if (!game || !game.details) {
          const response = await getGameBySteamId(input.id);
          if (!response) {
            console.warn(`Game with ID ${input.id} not found on Steam.`);
            throw new TRPCError({
              message: "Something went wrong",
              code: "INTERNAL_SERVER_ERROR",
            });
          }

          // Stringify the response ONCE to store in DB
          gameDetails = JSON.stringify(response);
          
          // Store/update in database
          await ctx.prisma!.game.upsert({
            where: { id: input.id },
            update: { details: gameDetails }, // Don't stringify again
            create: { id: input.id, details: gameDetails }, // Don't stringify again
          });
        }
        // Calculate average ratings
        const reviewStats =
          reviews.length > 0
            ? {
                totalReviews: reviews.length,
                methods: {
                  native: reviews.filter((r) => r.playMethod === "NATIVE")
                    .length,
                  crossover: reviews.filter((r) => r.playMethod === "CROSSOVER")
                    .length,
                  parallels: reviews.filter((r) => r.playMethod === "PARALLELS")
                    .length,
                  other: reviews.filter((r) => r.playMethod === "OTHER").length,
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
        throw new Error("Failed to fetch game details");
      }
    }),
    
});
