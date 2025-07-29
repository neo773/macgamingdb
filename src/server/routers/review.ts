import { z } from "zod";
import { router, procedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { getGameBySteamId } from "@/server/helpers/steam";
import { GraphicsSettingsEnum, PerformanceEnum, PlayMethodEnum, TranslationLayerEnum } from "../schema";
import type { PerformanceRating, PrismaClient } from "@prisma/client";
import type { Performance, Chipset, ChipsetVariant, PlayMethod } from "../schema";
import { updateAllPerformanceStatsForGame } from "../helpers/performance-stats";
import { getUploadSignedUrl, generateScreenshotKey, getPublicUrl } from "@/lib/s3";
import { MacSpecification } from "@/lib/scraper/EveryMacScraper";

// Helper function to calculate average performance
const calculateAveragePerformance = (reviews: { performance: PerformanceRating }[]) => {
  const performanceMap = {
    UNPLAYABLE: 0,
    BARELY_PLAYABLE: 1,
    PLAYABLE: 2,
    GOOD: 3,
    EXCELLENT: 4,
  };

  const sum = reviews.reduce((acc, review) => {
    return acc + (performanceMap[review.performance as keyof typeof performanceMap] || 0);
  }, 0);

  return reviews.length > 0 ? sum / reviews.length : 0;
};

// Convert average score to performance rating
const scoreToRating = (score: number): Performance => {
  if (score >= 3.5) return "EXCELLENT";
  if (score >= 2.5) return "GOOD";
  if (score >= 1.5) return "PLAYABLE";
  if (score >= 0.5) return "BARELY_PLAYABLE";
  return "UNPLAYABLE";
};

// Helper function to update aggregated performance for a game
const updateGameAggregatedPerformance = async (prisma: PrismaClient, gameId: string) => {
  const reviews = await prisma.gameReview.findMany({
    where: { gameId },
    select: { performance: true },
  });

  let aggregatedPerformance: Performance | null = null;
  if (reviews.length > 0) {
    const avgScore = calculateAveragePerformance(reviews);
    aggregatedPerformance = scoreToRating(avgScore);
  }

  await prisma.game.update({
    where: { id: gameId },
    data: { aggregatedPerformance },
  });

  return aggregatedPerformance;
};

// Main helper function to update all performance stats after a review change
const updateAllPerformanceStats = async (
  prisma: PrismaClient,
  gameId: string,
  chipset: Chipset,
  chipsetVariant: ChipsetVariant,
  playMethod: PlayMethod
) => {
  // First, update the game's aggregated performance
  await updateGameAggregatedPerformance(prisma, gameId);

  // Then update all performance stats using the shared helper
  await updateAllPerformanceStatsForGame(prisma, gameId, chipset, chipsetVariant, playMethod);
};

// Define schemas using Zod
const createReviewSchema = z.object({
  gameId: z.string(),
  playMethod: PlayMethodEnum,
  translationLayer: TranslationLayerEnum.nullable(),
  performance: PerformanceEnum,
  fps: z.number().nullable().optional(),
  graphicsSettings: GraphicsSettingsEnum,
  resolution: z.string().optional(),
  macConfigIdentifier: z.string(),
  notes: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  softwareVersion: z.string().optional(),
});

const deleteReviewSchema = z.object({
  reviewId: z.string(),
  confirmation: z.boolean(),
});

const updateReviewSchema = z.object({
  reviewId: z.string(),
  notes: z.string(),
  screenshots: z.array(z.string()).optional(),
});

const getUploadUrlSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
  gameId: z.string(),
});

export const reviewRouter = router({
  // Check if user is authenticated
  getUserAuth: procedure.query(async ({ ctx }) => {
    return {
      authenticated: !!ctx.user,
      user: ctx.user || null,
    };
  }),

  // Get Mac configurations with server-side filtering
  getMacConfigs: procedure
    .input(z.object({
      search: z.string().optional(),
      selectedConfigIdentifier: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const macConfigs = await ctx.prisma!.macConfig.findMany({
          orderBy: { identifier: 'asc' },
        });

        // Parse metadata and create searchable configs
        let configs = macConfigs.map(config => {
          const metadata = JSON.parse(config.metadata) as MacSpecification;
          return {
            id: config.id,
            identifier: config.identifier,
            label: metadata.model,
            metadata,
            searchText: [
              metadata.model,
              metadata.chip,
              metadata.chipVariant,
              metadata.family
            ].join(' ').toLowerCase(),
          };
        });

        // Server-side filtering if search term provided
        if (input.search?.trim()) {
          const searchTerms = input.search.toLowerCase().split(/\s+/).filter(Boolean);
          configs = configs.filter(config =>
            searchTerms.every(term => config.searchText.includes(term))
          );
        }

        // Group and sort for priority ordering
        const groupedConfigs: Record<string, typeof configs> = {};
        let selectedGroupKey: string | null = null;

        // Group by family
        for (const config of configs) {
          const family = config.metadata.family;
          if (!groupedConfigs[family]) groupedConfigs[family] = [];
          groupedConfigs[family].push(config);
          
          // Track selected item's group
          if (config.identifier === input.selectedConfigIdentifier) {
            selectedGroupKey = family;
          }
        }

        // Sort within groups (selected first)
        for (const family of Object.keys(groupedConfigs)) {
          groupedConfigs[family].sort((a, b) => {
            if (a.identifier === input.selectedConfigIdentifier) return -1;
            if (b.identifier === input.selectedConfigIdentifier) return 1;
            return 0;
          });
        }

        // Create final ordered list (selected group first)
        const finalConfigs: typeof configs = [];
        
        // Add selected group first
        if (selectedGroupKey && groupedConfigs[selectedGroupKey]) {
          finalConfigs.push(...groupedConfigs[selectedGroupKey]);
        }
        
        // Add other groups
        for (const [family, familyConfigs] of Object.entries(groupedConfigs)) {
          if (family !== selectedGroupKey) {
            finalConfigs.push(...familyConfigs);
          }
        }

        // Remove searchText from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return finalConfigs.map(({ searchText, ...config }) => config);
        
      } catch (error) {
        console.error("Error fetching Mac configs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch Mac configurations",
        });
      }
    }),

  // Get single Mac configuration by identifier
  getMacConfigById: procedure
    .input(z.object({
      identifier: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const macConfig = await ctx.prisma!.macConfig.findUnique({
          where: { identifier: input.identifier },
        });

        if (!macConfig) {
          return null;
        }

        const metadata = JSON.parse(macConfig.metadata) as MacSpecification;
        return {
          id: macConfig.id,
          identifier: macConfig.identifier,
          label: metadata.model,
          metadata,
        };
      } catch (error) {
        console.error("Error fetching Mac config:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch Mac configuration",
        });
      }
    }),

  // Generate presigned URL for screenshot upload
  getUploadUrl: protectedProcedure
    .input(getUploadUrlSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is authenticated
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Missing authorization",
          });
        }

        // Validate file type (only images)
        if (!input.contentType.startsWith("image/")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only image files are allowed",
          });
        }

                 // Generate S3 key
        const key = generateScreenshotKey(ctx.user.user.id, input.gameId, input.filename);

        // Get presigned URL
        const signedUrl = await getUploadSignedUrl(key, input.contentType);
        const publicUrl = getPublicUrl(key);

        return {
          signedUrl,
          publicUrl,
          key,
        };
      } catch (error) {
        console.error("Error generating presigned URL:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate upload URL",
        });
      }
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

        const macConfig = await ctx.prisma!.macConfig.findUnique({
          where: { identifier: input.macConfigIdentifier },
        });

        if (!macConfig) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Mac config not found",
          });
        }

        const macConfigMetadata = JSON.parse(macConfig.metadata) as MacSpecification;
        const hasScreenshots = input.screenshots && input.screenshots.length > 0;

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
            macConfigId: macConfig.id,
            chipset: macConfigMetadata.chip,
            chipsetVariant: macConfigMetadata.chipVariant as ChipsetVariant,
            notes: input.notes || null,
            screenshots: hasScreenshots ? JSON.stringify(input.screenshots) : null,
            softwareVersion: input.softwareVersion || null,
          },
        });

        // Revalidate the game page to reflect the new review
        revalidatePath(`/games/${input.gameId}`);

        // Update performance stats
        await updateAllPerformanceStats(ctx.prisma!, input.gameId, macConfigMetadata.chip as Chipset, macConfigMetadata.chipVariant as ChipsetVariant, input.playMethod);

        // Update review count
        await ctx.prisma!.game.update({
          where: { id: input.gameId },
          data: { reviewCount: { increment: 1 } },
        });

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

        // Update the review notes and screenshots
        await ctx.prisma!.gameReview.update({
          where: { id: input.reviewId },
          data: { 
            notes: input.notes,
            screenshots: input.screenshots ? JSON.stringify(input.screenshots) : undefined,
          },
        });

        // Revalidate paths
        revalidatePath(`/games/${review.gameId}`);
        revalidatePath('/my-reviews');

        // Update performance stats
        await updateAllPerformanceStats(
          ctx.prisma!, 
          review.gameId, 
          review.chipset as Chipset, 
          review.chipsetVariant as ChipsetVariant, 
          review.playMethod as PlayMethod
        );

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

        // Update review count
        await ctx.prisma!.game.update({
          where: { id: review.gameId },
          data: { reviewCount: { decrement: 1 } },
        });

        // Update performance stats
        await updateAllPerformanceStats(
          ctx.prisma!, 
          review.gameId, 
          review.chipset as Chipset, 
          review.chipsetVariant as ChipsetVariant, 
          review.playMethod as PlayMethod
        );

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
