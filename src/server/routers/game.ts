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
          // Fetch raw performance data with proper field selection
          const reviews = await tx.gameReview.findMany({
            select: {
              gameId: true,
              performance: true,
              playMethod: true,
            },
            where: {
              ...(chipset ? { chipset } : {}),
              ...(chipsetVariant ? { chipsetVariant } : {}),
              ...(playMethod !== 'ALL' ? { playMethod } : {}),
            },
          });
          
          type GamePerformance = {
            gameId: string;
            count: number;
            avgPerformance: number;
            rating: PerformanceRating;
          };

          // Define the performance mapping
          const perfValueMap: Record<PerformanceRating, number> = {
            UNPLAYABLE: 0,
            BARELY_PLAYABLE: 1,
            PLAYABLE: 2,
            GOOD: 3,
            EXCELLENT: 4,
          };

          // Performance rating thresholds
          const ratingThresholds = {
            EXCELLENT: 3.5,
            GOOD: 2.5,
            PLAYABLE: 1.5,
            BARELY_PLAYABLE: 0.5,
            UNPLAYABLE: 0,
          };
          
          // Calculate performance data in a single pass
          const ratingCounts: Record<PerformanceRating | 'ALL', number> = {
            ALL: 0,
            EXCELLENT: 0,
            GOOD: 0,
            PLAYABLE: 0,
            BARELY_PLAYABLE: 0,
            UNPLAYABLE: 0,
          };
          
          // Process all reviews in one pass to generate game stats
          const gameStats = new Map<string, { sum: number; count: number }>();
          
          // Group reviews by game and calculate performance sums
          reviews.forEach(review => {
            const { gameId, performance } = review;
            const perfValue = perfValueMap[performance as PerformanceRating];
            
            if (!gameStats.has(gameId)) {
              gameStats.set(gameId, { sum: 0, count: 0 });
            }
            
            const stats = gameStats.get(gameId)!;
            stats.sum += perfValue;
            stats.count += 1;
          });
          
          // Calculate average performance and determine ratings
          const gamePerformances: GamePerformance[] = Array.from(gameStats.entries())
            .map(([gameId, { sum, count }]) => {
              const avgPerformance = sum / count;
              
              // Calculate rating
              let rating: PerformanceRating;
              if (avgPerformance >= ratingThresholds.EXCELLENT) rating = 'EXCELLENT';
              else if (avgPerformance >= ratingThresholds.GOOD) rating = 'GOOD';
              else if (avgPerformance >= ratingThresholds.PLAYABLE) rating = 'PLAYABLE';
              else if (avgPerformance >= ratingThresholds.BARELY_PLAYABLE) rating = 'BARELY_PLAYABLE';
              else rating = 'UNPLAYABLE';
              
              // Update counts
              ratingCounts[rating]++;
              ratingCounts.ALL++;
              
              return { gameId, count, avgPerformance, rating };
            });
          
          // Filter games by performance rating
          const filteredGames = filter === 'ALL' 
            ? gamePerformances
            : gamePerformances.filter(game => game.rating === filter);
          
          // Sort by review count in descending order
          filteredGames.sort((a, b) => b.count - a.count);
          
          // Efficient pagination
          const startIndex = cursor 
            ? filteredGames.findIndex(game => game.gameId === cursor) + 1 
            : 0;
          
          // Get paginated game IDs
          const paginatedGames = filteredGames.slice(startIndex, startIndex + limit + 1);
          const paginatedGameIds = paginatedGames.map(g => g.gameId);
          
          // Single efficient database query for game details
          const games = paginatedGameIds.length > 0 
            ? await tx.game.findMany({
                where: { id: { in: paginatedGameIds } }
              })
            : [];
            
          // Create maps for O(1) lookups
          const gameMap = new Map(games.map(game => [game.id, game]));
          const perfInfoMap = new Map(paginatedGames.map(g => [g.gameId, { 
            rating: g.rating, 
            count: g.count 
          }]));
          
          // Create final result array in correct order
          const sortedGames = paginatedGameIds
            .map(id => gameMap.get(id))
            .filter(Boolean) as typeof games;
          
          // Process pagination
          let nextCursor: typeof cursor = undefined;
          if (sortedGames.length > limit) {
            const nextItem = sortedGames.pop();
            nextCursor = nextItem!.id;
          }

          // Efficiently map games with their performance data in a single operation
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
