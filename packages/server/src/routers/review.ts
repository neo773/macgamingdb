import { z } from 'zod';
import { router, procedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { revalidatePath } from 'next/cache';
import { resolveGame } from '../gameSources/resolveGame';
import { materializeGame } from '../gameSources/materializeGame';
import { parseGameRef } from '../gameSources/parseGameRef';
import {
  GraphicsSettingsEnum,
  PerformanceEnum,
  PlayMethodEnum,
  TranslationLayerEnum,
  type ChipsetVariant,
  type Performance,
} from '../schema';
import {
  getUploadSignedUrl,
  generateScreenshotKey,
  getPublicUrl,
} from '../services/s3';
import {
  CreateReviewResultSchema,
  MacConfigSchema,
  MutationResultSchema,
  MyReviewsSchema,
  UploadUrlSchema,
} from '../schema/openapi';
import { type MacSpecification } from '../scraper/EveryMacScraper';
import { calculateAveragePerformance } from '../utils/calculateAveragePerformance';
import { scoreToRating } from '../utils/scoreToRating';
import { type DrizzleDB } from '../database/drizzle';
import { games, gameReviews, macConfigs } from '../drizzle/schema';
import { desc, eq, sql } from 'drizzle-orm';

async function updateGameAggregatedPerformance(
  db: DrizzleDB,
  gameId: string,
) {
  const reviews = await db
    .select({ performance: gameReviews.performance })
    .from(gameReviews)
    .where(eq(gameReviews.gameId, gameId));

  let aggregatedPerformance: Performance | null = null;
  if (reviews.length > 0) {
    const avgScore = calculateAveragePerformance(reviews);
    aggregatedPerformance = scoreToRating(avgScore);
  }

  await db
    .update(games)
    .set({ aggregatedPerformance })
    .where(eq(games.id, gameId));
}

export const reviewRouter = router({
  getUserAuth: procedure.query(async ({ ctx }) => {
    return {
      authenticated: !!ctx.user,
      user: ctx.user || null,
    };
  }),

  listMine: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/reviews/mine', protect: true, tags: ['reviews'] } })
    .input(z.void())
    .output(MyReviewsSchema)
    .query(async ({ ctx }) => {
      if (!ctx.user?.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Missing authorization',
        });
      }

      try {
        const reviews = await ctx.db.query.gameReviews.findMany({
          where: eq(gameReviews.userId, ctx.user.user.id),
          with: {
            game: true,
            macConfig: true,
          },
          orderBy: desc(gameReviews.createdAt),
        });

        return reviews.map((review) => ({
          id: review.id,
          gameId: review.gameId,
          userId: review.userId,
          playMethod: review.playMethod,
          translationLayer: review.translationLayer,
          performance: review.performance,
          fps: review.fps,
          graphicsSettings: review.graphicsSettings,
          resolution: review.resolution,
          chipset: review.chipset,
          chipsetVariant: review.chipsetVariant,
          macConfigId: review.macConfigId,
          notes: review.notes,
          screenshots: review.screenshots,
          softwareVersion: review.softwareVersion,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          macConfig: review.macConfig,
          gameName: review.game.name,
          gameSlug: review.game.slug,
          gameHeaderImage: review.game.headerImage,
        }));
      } catch (error) {
        console.error('Error fetching my reviews:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch reviews',
        });
      }
    }),

  getMacConfigs: procedure
    .meta({ openapi: { method: 'GET', path: '/mac-configs', protect: false, tags: ['mac-configs'] } })
    .input(
      z.object({
        search: z.string().optional(),
        selectedConfigIdentifier: z.string().optional(),
      }),
    )
    .output(z.array(MacConfigSchema))
    .query(async ({ input, ctx }) => {
      try {
        const allMacConfigs = await ctx.db
          .select()
          .from(macConfigs)
          .orderBy(macConfigs.identifier);

        let configs = allMacConfigs.map((config) => {
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

        // eslint-disable-next-line unused-imports/no-unused-vars
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
    .meta({ openapi: { method: 'GET', path: '/mac-configs/{identifier}', protect: false, tags: ['mac-configs'] } })
    .input(
      z.object({
        identifier: z.string(),
      }),
    )
    .output(MacConfigSchema.nullable())
    .query(async ({ input, ctx }) => {
      try {
        const macConfig = await ctx.db.query.macConfigs.findFirst({
          where: eq(macConfigs.identifier, input.identifier),
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
    .meta({ openapi: { method: 'POST', path: '/reviews/upload-url', protect: true, tags: ['reviews'] } })
    .input(z.object({
      filename: z.string(),
      contentType: z.string(),
      gameId: z.string(),
    }))
    .output(UploadUrlSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing authorization',
          });
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(input.contentType)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Only PNG, JPG, WebP, and GIF files are allowed',
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
    .meta({ openapi: { method: 'POST', path: '/reviews', protect: true, tags: ['reviews'] } })
    .output(CreateReviewResultSchema)
    .input(z.object({
      gameId: z.string(),
      playMethod: PlayMethodEnum,
      // nullish: REST clients omit the key entirely for Native reviews
      translationLayer: TranslationLayerEnum.nullish(),
      performance: PerformanceEnum,
      fps: z.number().nullable().optional(),
      graphicsSettings: GraphicsSettingsEnum,
      resolution: z.string().optional(),
      macConfigIdentifier: z.string(),
      notes: z.string().optional(),
      screenshots: z.array(z.string()).optional(),
      softwareVersion: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing authorization',
          });
        }

        let game = await resolveGame(ctx.db, input.gameId);

        if (!game) {
          const ref = parseGameRef(input.gameId);
          game = ref
            ? await materializeGame(ctx.db, ref.source, ref.externalId)
            : null;
        }

        if (!game) {
          return null;
        }

        const macConfig = await ctx.db.query.macConfigs.findFirst({
          where: eq(macConfigs.identifier, input.macConfigIdentifier),
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

        const [review] = await ctx.db
          .insert(gameReviews)
          .values({
            gameId: game.id,
            userId: ctx.user.user.id,
            playMethod: input.playMethod,
            translationLayer: input.translationLayer,
            performance: input.performance,
            fps: input.fps ?? null,
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
          })
          .returning();

        revalidatePath(`/games/${game.slug ?? game.id}`);
        revalidatePath('/contributors');

        await updateGameAggregatedPerformance(ctx.db, game.id);

        await ctx.db
          .update(games)
          .set({ reviewCount: sql`${games.reviewCount} + 1` })
          .where(eq(games.id, game.id));

        return { review };
      } catch (error) {
        console.error('Error creating review:', error);
        throw new Error('Failed to create review');
      }
    }),

  updateReview: protectedProcedure
    .meta({ openapi: { method: 'PATCH', path: '/reviews/{reviewId}', protect: true, tags: ['reviews'] } })
    .output(MutationResultSchema)
    .input(z.object({
      reviewId: z.string(),
      notes: z.string(),
      performance: PerformanceEnum.optional(),
      fps: z.number().nullable().optional(),
      resolution: z.string().nullable().optional(),
      softwareVersion: z.string().nullable().optional(),
      screenshots: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing authorization',
          });
        }

        const review = await ctx.db.query.gameReviews.findFirst({
          where: eq(gameReviews.id, input.reviewId),
          with: { game: true },
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

        const updateData: Record<string, unknown> = {
          notes: input.notes.trim() || null,
        };

        if (input.performance !== undefined) {
          updateData.performance = input.performance;
        }

        if (input.fps !== undefined) {
          updateData.fps = input.fps;
        }

        if (input.resolution !== undefined) {
          updateData.resolution = input.resolution?.trim() || null;
        }

        if (input.softwareVersion !== undefined) {
          updateData.softwareVersion = input.softwareVersion?.trim() || null;
        }

        if (input.screenshots) {
          updateData.screenshots = JSON.stringify(input.screenshots);
        }

        await ctx.db
          .update(gameReviews)
          .set(updateData)
          .where(eq(gameReviews.id, input.reviewId));

        if (
          input.performance !== undefined &&
          input.performance !== review.performance
        ) {
          await updateGameAggregatedPerformance(ctx.db, review.gameId);
        }

        revalidatePath(`/games/${review.gameId}`);
        revalidatePath('/my-reviews');
        revalidatePath('/contributors');

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
    .meta({ openapi: { method: 'DELETE', path: '/reviews/{reviewId}', protect: true, tags: ['reviews'] } })
    .input(z.object({
      reviewId: z.string(),
      confirmation: z.boolean(),
    }))
    .output(MutationResultSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing authorization',
          });
        }

        const review = await ctx.db.query.gameReviews.findFirst({
          where: eq(gameReviews.id, input.reviewId),
          with: { game: true },
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

        await ctx.db
          .delete(gameReviews)
          .where(eq(gameReviews.id, input.reviewId));

        revalidatePath(`/games/${review.gameId}`);
        revalidatePath('/my-reviews');
        revalidatePath('/contributors');

        await ctx.db
          .update(games)
          .set({ reviewCount: sql`${games.reviewCount} - 1` })
          .where(eq(games.id, review.gameId));

        await updateGameAggregatedPerformance(ctx.db, review.gameId);

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
