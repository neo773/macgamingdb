import { z } from "zod";
import { router, procedure } from "../trpc";
import { getGameBySteamId, searchSteam, SteamAppData } from "@/server/helpers/steam";
import { TRPCError } from "@trpc/server";
import { GameReview, PerformanceRating } from "@prisma/client";
import { PerformanceEnum } from "../schema";

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
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { limit, cursor, filter } = input;

        // Use a transaction to ensure data consistency and optimize database calls
        return await ctx.prisma!.$transaction(async (tx) => {
          // Get all reviews with minimal fields for performance calculation
          const reviews = await tx.gameReview.findMany({
            select: {
              gameId: true,
              performance: true,
            }
          });

          // Pre-define performance mapping for faster lookups
          const performanceMap: Record<PerformanceRating, number> = {
            UNPLAYABLE: 0,
            BARELY_PLAYABLE: 1,
            PLAYABLE: 2,
            GOOD: 3,
            EXCELLENT: 4,
          };

          // Use Map objects for better performance with large datasets
          const gamePerformanceSum = new Map<string, number>();
          const gameReviewCounts = new Map<string, number>();
          const gamePerformanceRating = new Map<string, PerformanceRating>();
          
          // Single-pass processing of reviews
          for (const review of reviews) {
            const { gameId, performance } = review;
            const performanceValue = performanceMap[performance as keyof typeof performanceMap];
            
            if (!gamePerformanceSum.has(gameId)) {
              gamePerformanceSum.set(gameId, 0);
              gameReviewCounts.set(gameId, 0);
              gamePerformanceRating.set(gameId, 'PLAYABLE'); // Default
            }
            
            gamePerformanceSum.set(gameId, (gamePerformanceSum.get(gameId) || 0) + performanceValue);
            gameReviewCounts.set(gameId, (gameReviewCounts.get(gameId) || 0) + 1);
          }
          
          // Calculate average and set performance ratings in a single pass
          const ratingCounts: Record<PerformanceRating | 'ALL', number> = {
            ALL: gamePerformanceSum.size,
            EXCELLENT: 0,
            GOOD: 0,
            PLAYABLE: 0,
            BARELY_PLAYABLE: 0,
            UNPLAYABLE: 0,
          };
          
          // Determine game IDs to fetch based on filter
          let gameIds: string[] = [];
          
          for (const [gameId, sum] of gamePerformanceSum.entries()) {
            const count = gameReviewCounts.get(gameId) || 1;
            const avgPerformance = sum / count;
            
            let rating: PerformanceRating;
            if (avgPerformance >= 3.5) rating = 'EXCELLENT';
            else if (avgPerformance >= 2.5) rating = 'GOOD';
            else if (avgPerformance >= 1.5) rating = 'PLAYABLE';
            else if (avgPerformance >= 0.5) rating = 'BARELY_PLAYABLE';
            else rating = 'UNPLAYABLE';
            
            gamePerformanceRating.set(gameId, rating);
            ratingCounts[rating]++;
            
            if (filter === 'ALL' || filter === rating) {
              gameIds.push(gameId);
            }
          }
          
          // Fetch games with optimized query
          const games = await tx.game.findMany({
            take: limit + 1,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            where: {
              id: filter === 'ALL' ? { in: [...gamePerformanceSum.keys()] } : { in: gameIds }
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          // Process pagination
          let nextCursor: typeof cursor = undefined;
          if (games.length > limit) {
            const nextItem = games.pop();
            nextCursor = nextItem!.id;
          }

          // Create a Map for fast review count lookups
          const reviewCountMap = new Map<string, number>();
          for (const [gameId, count] of gameReviewCounts.entries()) {
            reviewCountMap.set(gameId, count);
          }

          // Efficiently map games with their performance data
          const gamesWithPerformance = games.map(game => ({
            ...game,
            performanceRating: gamePerformanceRating.get(game.id) || 'PLAYABLE',
            reviewCount: reviewCountMap.get(game.id) || 0,
          }));

          return {
            games: gamesWithPerformance,
            nextCursor,
            totalCount: gameIds.length,
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

// Helper function to calculate average performance
function calculateAveragePerformance(reviews: GameReview[]) {
  const performanceMap: Record<PerformanceRating, number> = {
    UNPLAYABLE: 0,
    BARELY_PLAYABLE: 1,
    PLAYABLE: 2,
    GOOD: 3,
    EXCELLENT: 4,
  };

  const sum = reviews.reduce((acc, review) => {
    return (
      acc + performanceMap[review.performance as keyof typeof performanceMap]
    );
  }, 0);

  return reviews.length > 0 ? sum / reviews.length : 0;
}

// Helper function to calculate translation layer statistics
function calculateTranslationLayerStats(reviews: GameReview[]) {
  const layers = ["DXVK", "DXMT", "D3D_METAL", "NONE"];
  const stats: Record<string, { count: number; averagePerformance: number }> =
    {};

  layers.forEach((layer) => {
    const layerReviews = reviews.filter((r) => r.translationLayer === layer);
    stats[layer] = {
      count: layerReviews.length,
      averagePerformance: calculateAveragePerformance(layerReviews),
    };
  });

  return stats;
}
