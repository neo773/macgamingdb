import { z } from 'zod';
import { router, procedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { revalidatePath } from 'next/cache';
import { getGameBySteamId } from '@/server/helpers/steam';
import {
  GraphicsSettingsEnum,
  PerformanceEnum,
  PlayMethodEnum,
  TranslationLayerEnum,
  type Performance,
  type Chipset,
  type ChipsetVariant,
  type PlayMethod,
} from '../schema';
import type { PrismaClient } from '@/generated/prisma/client';
import { updateAllPerformanceStatsForGame } from '../helpers/performance-stats';
import {
  getUploadSignedUrl,
  generateScreenshotKey,
  getPublicUrl,
} from '@/lib/s3';
import { type MacSpecification } from '@/lib/scraper/EveryMacScraper';
import { scoreToRating } from '../utils/scoreToRating';
import { calculateAveragePerformance } from '../utils/calculateAveragePerformance';

const updateGameAggregatedPerformance = async (
  prisma: PrismaClient,
  gameId: string,
) => {
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

const updateAllPerformanceStats = async (
  prisma: PrismaClient,
  gameId: string,
  chipset: Chipset,
  chipsetVariant: ChipsetVariant,
  playMethod: PlayMethod,
) => {
  await updateGameAggregatedPerformance(prisma, gameId);

  await updateAllPerformanceStatsForGame(
    prisma,
    gameId,
    chipset,
    chipsetVariant,
    playMethod,
  );
};

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
  getUserAuth: procedure.query(async ({ ctx }) => {
    return {
      authenticated: !!ctx.user,
      user: ctx.user || null,
    };
  }),

  getMacConfigs: procedure
    .input(
      z.object({
        search: z.string().optional(),
        selectedConfigIdentifier: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const macConfigs = await ctx.prisma!.macConfig.findMany({
          orderBy: { identifier: 'asc' },
        });

        let configs = macConfigs.map((config) => {
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
              metadata.family,
            ]
              .join(' ')
              .toLowerCase(),
          };
        });

        if (input.search?.trim()) {
          const searchTerms = input.search
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);
          configs = configs.filter((config) =>
            searchTerms.every((term) => config.searchText.includes(term)),
          );
        }

        const groupedConfigs: Record<string, typeof configs> = {};
        let selectedGroupKey: string | null = null;

        for (const config of configs) {
          const family = config.metadata.family;
          if (!groupedConfigs[family]) groupedConfigs[family] = [];
          groupedConfigs[family].push(config);

          if (config.identifier === input.selectedConfigIdentifier) {
            selectedGroupKey = family;
          }
        }

        for (const family of Object.keys(groupedConfigs)) {
          groupedConfigs[family].sort((a, b) => {
            if (a.identifier === input.selectedConfigIdentifier) return -1;
            if (b.identifier === input.selectedConfigIdentifier) return 1;
            return 0;
          });
        }

        const finalConfigs: typeof configs = [];

        if (selectedGroupKey && groupedConfigs[selectedGroupKey]) {
          finalConfigs.push(...groupedConfigs[selectedGroupKey]);
        }

        for (const [family, familyConfigs] of Object.entries(groupedConfigs)) {
          if (family !== selectedGroupKey) {
            finalConfigs.push(...familyConfigs);
          }
        }

        return finalConfigs.map(({ searchText, ...config }) => config);
      } catch (error) {
        console.error('Error fetching Mac configs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch Mac configurations',
        });
      }
    }),

  getMacConfigById: procedure
    .input(
      z.object({
        identifier: z.string(),
      }),
    )
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
        console.error('Error fetching Mac config:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch Mac configuration',
        });
      }
    }),

  getUploadUrl: protectedProcedure
    .input(getUploadUrlSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing authorization',
          });
        }

        if (!input.contentType.startsWith('image/')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Only image files are allowed',
          });
        }

        const key = generateScreenshotKey(
          ctx.user.user.id,
          input.gameId,
          input.filename,
        );

        const signedUrl = await getUploadSignedUrl(key, input.contentType);
        const publicUrl = getPublicUrl(key);

        return {
          signedUrl,
          publicUrl,
          key,
        };
      } catch (error) {
        console.error('Error generating presigned URL:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate upload URL',
        });
      }
    }),

  create: protectedProcedure
    .input(createReviewSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing authorization',
          });
        }

        const gameExists = await ctx.prisma!.game.findUnique({
          where: { id: input.gameId },
        });

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
            code: 'NOT_FOUND',
            message: 'Mac config not found',
          });
        }

        const macConfigMetadata = JSON.parse(
          macConfig.metadata,
        ) as MacSpecification;
        const hasScreenshots =
          input.screenshots && input.screenshots.length > 0;

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
            screenshots: hasScreenshots
              ? JSON.stringify(input.screenshots)
              : null,
            softwareVersion: input.softwareVersion || null,
          },
        });

        revalidatePath(`/games/${input.gameId}`);

        await updateAllPerformanceStats(
          ctx.prisma!,
          input.gameId,
          macConfigMetadata.chip as Chipset,
          macConfigMetadata.chipVariant as ChipsetVariant,
          input.playMethod,
        );

        await ctx.prisma!.game.update({
          where: { id: input.gameId },
          data: { reviewCount: { increment: 1 } },
        });

        return { review };
      } catch (error) {
        console.error('Error creating review:', error);
        throw new Error('Failed to create review');
      }
    }),

  updateReview: protectedProcedure
    .input(updateReviewSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing authorization',
          });
        }

        const review = await ctx.prisma!.gameReview.findUnique({
          where: { id: input.reviewId },
          include: { game: true },
        });

        if (!review) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Review not found',
          });
        }

        if (review.userId !== ctx.user.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only update your own reviews',
          });
        }

        await ctx.prisma!.gameReview.update({
          where: { id: input.reviewId },
          data: {
            notes: input.notes,
            screenshots: input.screenshots
              ? JSON.stringify(input.screenshots)
              : undefined,
          },
        });

        revalidatePath(`/games/${review.gameId}`);
        revalidatePath('/my-reviews');

        await updateAllPerformanceStats(
          ctx.prisma!,
          review.gameId,
          review.chipset as Chipset,
          review.chipsetVariant as ChipsetVariant,
          review.playMethod as PlayMethod,
        );

        return { success: true, message: 'Review updated successfully' };
      } catch (error) {
        console.error('Error updating review:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update review',
        });
      }
    }),

  deleteReview: protectedProcedure
    .input(deleteReviewSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing authorization',
          });
        }

        const review = await ctx.prisma!.gameReview.findUnique({
          where: { id: input.reviewId },
          include: { game: true },
        });

        if (!review) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Review not found',
          });
        }

        if (review.userId !== ctx.user.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only delete your own reviews',
          });
        }

        if (!input.confirmation) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Please confirm deletion',
          });
        }

        await ctx.prisma!.gameReview.delete({
          where: { id: input.reviewId },
        });

        revalidatePath(`/games/${review.gameId}`);
        revalidatePath('/my-reviews');

        await ctx.prisma!.game.update({
          where: { id: review.gameId },
          data: { reviewCount: { decrement: 1 } },
        });

        await updateAllPerformanceStats(
          ctx.prisma!,
          review.gameId,
          review.chipset as Chipset,
          review.chipsetVariant as ChipsetVariant,
          review.playMethod as PlayMethod,
        );

        return { success: true, message: 'Review deleted successfully' };
      } catch (error) {
        console.error('Error deleting review:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete review',
        });
      }
    }),
});
