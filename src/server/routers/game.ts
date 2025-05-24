import { z } from "zod";
import { router, procedure } from "../trpc";
import { getGameBySteamId, searchSteam } from "@/server/helpers/steam";
import { TRPCError } from "@trpc/server";
import { PerformanceRating } from "@prisma/client";
import {
  ChipsetEnum,
  ChipsetVariantEnum,
  PerformanceEnum,
  PlayMethodEnum,
  type Chipset,
  type ChipsetVariant,
  type PlayMethod,
} from "../schema";
import {
  calculateAveragePerformance,
  calculateTranslationLayerStats,
} from "../utils";

import { formatQuery } from "prisma-query-formatter";


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

  getFilterCounts: procedure
    .input(
      z.object({
        chipset: ChipsetEnum.optional(),
        chipsetVariant: ChipsetVariantEnum.optional(),
        playMethod: z.enum(["ALL", ...PlayMethodEnum.options]).default("ALL"),
      })
    )
    .query(async ({ input, ctx }) => {
      const { chipset, chipsetVariant, playMethod } = input;

      
      // Determine query parameters based on aggregate logic
      let queryChipset: string | undefined;
      let queryChipsetVariant: ChipsetVariant | undefined; 
      let queryPlayMethod: PlayMethod | undefined;

      // Handle chipset logic
      if (chipset) {
        // Specific chipset requested
        queryChipset = chipset;
        queryChipsetVariant = chipsetVariant; // Can be specific or undefined for all variants of this chipset
      } else {
        // ALL chipsets requested - use aggregate records
        queryChipset = "ALL";
        queryChipsetVariant = "BASE" as ChipsetVariant; // Our representative for aggregates
      }

      // Handle play method logic  
      if (playMethod === "ALL") {
        // ALL play methods requested - use "OTHER" which represents ALL in aggregates
        queryPlayMethod = "OTHER" as PlayMethod;
      } else {
        // Specific play method requested
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
          acc[stat.performanceRating] += stat.count;
          return acc;
        },
        {
          ALL: 0,
          EXCELLENT: 0,
          GOOD: 0,
          PLAYABLE: 0,
          BARELY_PLAYABLE: 0,
          UNPLAYABLE: 0,
        }
      );

      return ratingCounts;
    }),

  getGames: procedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(6),
        cursor: z.number().min(0).default(0),
        performance: z.enum(["ALL", ...PerformanceEnum.options]).default("ALL"),
        chipset: ChipsetEnum.optional(),
        chipsetVariant: ChipsetVariantEnum.optional(),
        playMethod: z.enum(["ALL", ...PlayMethodEnum.options]).default("ALL"),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { limit, cursor: offset, performance, chipset, chipsetVariant, playMethod } = input;
            // @ts-ignore
      ctx.prisma.$on("query", (e) => {
        // @ts-ignore
        console.debug(`DEBUG: ---- ${formatQuery(e.query, e.params)}`);
      });
        
        // Check if we need review-based filtering
        const needsReviewFiltering = chipset || (playMethod !== "ALL");
        
        const games = await ctx.prisma!.game.findMany({
          where: {
            ...(performance !== "ALL" && { aggregatedPerformance: performance }),
            ...(needsReviewFiltering && {
              reviews: {
                some: {
                  ...(chipset && { chipset }),
                  ...(chipsetVariant && { chipsetVariant }),
                  ...(playMethod !== "ALL" && { playMethod })
                }
              }
            })
          },
          skip: offset,
          take: limit + 1, // +1 to check for next page
          orderBy: {
            reviewCount: "desc"
          }
        });

        // Process results
        const gamesWithPerformance = games
          .filter((game): game is typeof game & { aggregatedPerformance: NonNullable<typeof game.aggregatedPerformance> } => 
            game.aggregatedPerformance !== null
          )
          .map((game) => ({
            id: game.id,
            details: game.details,
            performanceRating: game.aggregatedPerformance,
          }));

        // Handle pagination
        const hasNextPage = gamesWithPerformance.length > limit;
        const gamesToReturn = hasNextPage ? gamesWithPerformance.slice(0, limit) : gamesWithPerformance;

        return {
          games: gamesToReturn,
          hasNextPage,
          nextOffset: hasNextPage ? offset + limit : undefined,
        };
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
