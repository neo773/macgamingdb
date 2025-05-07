import { z } from "zod";
import { router, procedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { getGameBySteamId } from "@/server/helpers/steam";
import { ChipsetEnum, ChipsetVariantEnum, GraphicsSettingsEnum, PerformanceEnum, PlayMethodEnum, TranslationLayerEnum } from "../schema";

// Define schemas using Zod
const createReviewSchema = z.object({
  gameId: z.string(),
  playMethod: PlayMethodEnum,
  translationLayer: TranslationLayerEnum.nullable(),
  performance: PerformanceEnum,
  fps: z.number().nullable().optional(),
  graphicsSettings: GraphicsSettingsEnum,
  resolution: z.string().optional(),
  chipset: ChipsetEnum,
  chipsetVariant: ChipsetVariantEnum,
  notes: z.string().optional(),
  softwareVersion: z.string().optional(),
});

const deleteReviewSchema = z.object({
  reviewId: z.string(),
  confirmation: z.boolean(),
});

const updateReviewSchema = z.object({
  reviewId: z.string(),
  notes: z.string(),
});

export const reviewRouter = router({
  // Get all enum values for client-side use
  getEnumValues: procedure.query(() => {
    return {
      playMethods: PlayMethodEnum.options,
      translationLayers: TranslationLayerEnum.options,
      performanceRatings: PerformanceEnum.options,
      graphicsSettings: GraphicsSettingsEnum.options,
      chipsets: ChipsetEnum.options,
      chipsetVariants: ChipsetVariantEnum.options,
    };
  }),

  // Get version defaults for different software
  getSoftwareVersions: procedure.query(() => {
    return {
      CROSSOVER: ["25.0", "24.0"],
      PARALLELS: ["20", "19"],
    };
  }),

  // Get chipset combinations
  getChipsetCombinations: procedure.query(() => {
    const combinations = [];
    for (const chipset of ChipsetEnum.options) {
      for (const variant of ChipsetVariantEnum.options) {
        combinations.push({
          value: `${chipset}-${variant}`,
          label: variant === "BASE" ? chipset : `${chipset} ${variant}`,
        });
      }
    }
    return combinations;
  }),

  // Check if user is authenticated
  getUserAuth: procedure.query(async ({ ctx }) => {
    return {
      authenticated: !!ctx.user,
      user: ctx.user || null,
    };
  }),

  create: protectedProcedure
    .input(createReviewSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is authenticated first
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Missing authorization",
          });
        }

        // Validate the game exists and get its details
        const gameExists = await ctx.prisma!.game.findUnique({
          where: { id: input.gameId },
        });

        // Only fetch game details from Steam if they don't exist in our database
        if (!gameExists) {

          const gameDetails = await getGameBySteamId(input.gameId);

          if (!gameDetails) {
            return null;
          }
      
          await ctx.prisma!.game.upsert({
            where: { id: input.gameId },
            update: { details: JSON.stringify(gameDetails) },
            create: { id: input.gameId, details: JSON.stringify(gameDetails) },
          });
        }

        // Create the review with the authenticated user's ID
        const review = await ctx.prisma!.gameReview.create({
          data: {
            gameId: input.gameId,
            userId: ctx.user.user.id,
            playMethod: input.playMethod,
            translationLayer: input.translationLayer,
            performance: input.performance,
            fps: input.fps,
            graphicsSettings: input.graphicsSettings,
            resolution: input.resolution || null,
            chipset: input.chipset,
            chipsetVariant: input.chipsetVariant,
            notes: input.notes || null,
            softwareVersion: input.softwareVersion || null,
          },
        });

        // Revalidate the game page to reflect the new review
        revalidatePath(`/games/${input.gameId}`);

        return { review };
      } catch (error) {
        console.error("Error creating review:", error);
        throw new Error("Failed to create review");
      }
    }),

  updateReview: protectedProcedure
    .input(updateReviewSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is authenticated
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Missing authorization",
          });
        }

        // Find the review
        const review = await ctx.prisma!.gameReview.findUnique({
          where: { id: input.reviewId },
          include: { game: true },
        });

        // Check if review exists
        if (!review) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Review not found",
          });
        }

        // Check if the review belongs to the authenticated user
        if (review.userId !== ctx.user.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only update your own reviews",
          });
        }

        // Update the review notes
        const updatedReview = await ctx.prisma!.gameReview.update({
          where: { id: input.reviewId },
          data: { 
            notes: input.notes 
          },
        });

        // Revalidate paths
        revalidatePath(`/games/${review.gameId}`);
        revalidatePath('/my-reviews');

        return { success: true, message: "Review updated successfully" };
      } catch (error) {
        console.error("Error updating review:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update review",
        });
      }
    }),

  deleteReview: protectedProcedure
    .input(deleteReviewSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is authenticated
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Missing authorization",
          });
        }

        // Find the review
        const review = await ctx.prisma!.gameReview.findUnique({
          where: { id: input.reviewId },
          include: { game: true },
        });

        // Check if review exists
        if (!review) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Review not found",
          });
        }

        // Check if the review belongs to the authenticated user
        if (review.userId !== ctx.user.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only delete your own reviews",
          });
        }

        // Check if the user has confirmed deletion
        if (!input.confirmation) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Please confirm deletion",
          });
        }

        // Delete the review
        await ctx.prisma!.gameReview.delete({
          where: { id: input.reviewId },
        });

        // Revalidate paths
        revalidatePath(`/games/${review.gameId}`);
        revalidatePath('/my-reviews');

        return { success: true, message: "Review deleted successfully" };
      } catch (error) {
        console.error("Error deleting review:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete review",
        });
      }
    }),
});
