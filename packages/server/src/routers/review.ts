import { z } from 'zod';
import { router, procedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { revalidatePath } from 'next/cache';
import { getGameBySteamId } from '../api/steam';
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
import { type MacSpecification } from '../scraper/EveryMacScraper';
import { calculateAveragePerformance } from '../utils/calculateAveragePerformance';
import { scoreToRating } from '../utils/scoreToRating';
import { type DrizzleDB } from '../database/drizzle';
import { games, gameReviews, macConfigs } from '../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

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

  getMacConfigs: procedure
    .input(
      z.object({
        search: z.string().optional(),
        selectedConfigIdentifier: z.string().optional(),
      }),
    )
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
    .input(
      z.object({
        identifier: z.string(),
      }),
    )
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
    .input(z.object({
      filename: z.string(),
      contentType: z.string(),
      gameId: z.string(),
    }))
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
    .input(z.object({
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
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing authorization',
          });
        }

        const gameExists = await ctx.db.query.games.findFirst({
          where: eq(games.id, input.gameId),
        });

        if (!gameExists) {
          const gameDetails = await getGameBySteamId(input.gameId);

          if (!gameDetails) {
            return null;
          }

          await ctx.db
            .insert(games)
            .values({ id: input.gameId, details: JSON.stringify(gameDetails) })
            .onConflictDoUpdate({
              target: games.id,
              set: { details: JSON.stringify(gameDetails) },
            });
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
            gameId: input.gameId,
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

        revalidatePath(`/games/${input.gameId}`);

        await updateGameAggregatedPerformance(ctx.db, input.gameId);

        await ctx.db
          .update(games)
          .set({ reviewCount: sql`${games.reviewCount} + 1` })
          .where(eq(games.id, input.gameId));

        return { review };
      } catch (error) {
        console.error('Error creating review:', error);
        throw new Error('Failed to create review');
      }
    }),

  updateReview: protectedProcedure
    .input( z.object({
      reviewId: z.string(),
      notes: z.string(),
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

        const updateData: Record<string, unknown> = { notes: input.notes };
        if (input.screenshots) {
          updateData.screenshots = JSON.stringify(input.screenshots);
        }

        await ctx.db
          .update(gameReviews)
          .set(updateData)
          .where(eq(gameReviews.id, input.reviewId));

        revalidatePath(`/games/${review.gameId}`);
        revalidatePath('/my-reviews');

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
    .input(z.object({
      reviewId: z.string(),
      confirmation: z.boolean(),
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
