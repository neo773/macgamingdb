import { z } from "zod";
import { router, procedure } from "../trpc";
import { getGameBySteamId, searchSteam, SteamAppData } from "@/server/helpers/steam";
import { TRPCError } from "@trpc/server";
import { GameReview } from "@prisma/client";

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

          gameDetails = JSON.stringify(response);
          // Store/update in database

          await ctx.prisma!.game.upsert({
            where: { id: input.id },
            update: { details: JSON.stringify(gameDetails) },
            create: { id: input.id, details: JSON.stringify(gameDetails) },
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
  const performanceMap = {
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
