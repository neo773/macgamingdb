import { Inject } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { AuthMiddleware } from '../../../engine/api/trpc/auth.middleware';
import {
  GraphicsSettingsEnum,
  PerformanceEnum,
  PlayMethodEnum,
  TranslationLayerEnum,
  type GraphicsSettings,
  type Performance,
  type PlayMethod,
  type TranslationLayer,
} from '../../../schema';
import { MacConfigSchema } from '../../mac-config/dtos/mac-config.dto';
import { CreateReviewResultSchema } from '../dtos/create-review-result.dto';
import { MutationResultSchema } from '../dtos/mutation-result.dto';
import { MyReviewsSchema } from '../dtos/my-reviews.dto';
import { UploadUrlSchema } from '../dtos/upload-url.dto';
import { ReviewService } from '../services/review.service';

type SessionContext = { user?: { user?: { id?: string } } | null };

const requireUserId = (ctx: SessionContext): string => {
  const userId = ctx.user?.user?.id;
  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing authorization',
    });
  }
  return userId;
};

@Router({ alias: 'review' })
export class ReviewRouter {
  constructor(
    @Inject(ReviewService) private readonly reviewService: ReviewService,
  ) {}

  @Query()
  async getUserAuth(@Ctx() ctx: SessionContext) {
    return {
      authenticated: !!ctx.user,
      user: ctx.user || null,
    };
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.void(),
    output: MyReviewsSchema,
    meta: {
      openapi: { method: 'GET', path: '/reviews/mine', protect: true, tags: ['reviews'] },
    },
  })
  async listMine(@Ctx() ctx: SessionContext) {
    return this.reviewService.listMine(requireUserId(ctx));
  }

  @Query({
    input: z.object({
      search: z.string().optional(),
      selectedConfigIdentifier: z.string().optional(),
    }),
    output: z.array(MacConfigSchema),
    meta: {
      openapi: { method: 'GET', path: '/mac-configs', protect: false, tags: ['mac-configs'] },
    },
  })
  async getMacConfigs(
    @Input() input: { search?: string; selectedConfigIdentifier?: string },
  ) {
    return this.reviewService.getMacConfigs(input);
  }

  @Query({
    input: z.object({ identifier: z.string() }),
    output: MacConfigSchema.nullable(),
    meta: {
      openapi: { method: 'GET', path: '/mac-configs/{identifier}', protect: false, tags: ['mac-configs'] },
    },
  })
  async getMacConfigById(@Input('identifier') identifier: string) {
    return this.reviewService.getMacConfigById(identifier);
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      filename: z.string(),
      contentType: z.string(),
      gameId: z.string(),
    }),
    output: UploadUrlSchema,
    meta: {
      openapi: { method: 'POST', path: '/reviews/upload-url', protect: true, tags: ['reviews'] },
    },
  })
  async getUploadUrl(
    @Input() input: { filename: string; contentType: string; gameId: string },
    @Ctx() ctx: SessionContext,
  ) {
    return this.reviewService.getUploadUrl({
      userId: requireUserId(ctx),
      ...input,
    });
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      gameId: z.string(),
      playMethod: PlayMethodEnum,
      translationLayer: TranslationLayerEnum.nullish(),
      performance: PerformanceEnum,
      fps: z.number().nullable().optional(),
      graphicsSettings: GraphicsSettingsEnum,
      resolution: z.string().optional(),
      macConfigIdentifier: z.string(),
      notes: z.string().optional(),
      screenshots: z.array(z.string()).optional(),
      softwareVersion: z.string().optional(),
    }),
    output: CreateReviewResultSchema,
    meta: {
      openapi: { method: 'POST', path: '/reviews', protect: true, tags: ['reviews'] },
    },
  })
  async create(
    @Input()
    input: {
      gameId: string;
      playMethod: PlayMethod;
      translationLayer?: TranslationLayer | null;
      performance: Performance;
      fps?: number | null;
      graphicsSettings: GraphicsSettings;
      resolution?: string;
      macConfigIdentifier: string;
      notes?: string;
      screenshots?: string[];
      softwareVersion?: string;
    },
    @Ctx() ctx: SessionContext,
  ) {
    return this.reviewService.create({ userId: requireUserId(ctx), ...input });
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      reviewId: z.string(),
      notes: z.string(),
      performance: PerformanceEnum.optional(),
      fps: z.number().nullable().optional(),
      resolution: z.string().nullable().optional(),
      softwareVersion: z.string().nullable().optional(),
      screenshots: z.array(z.string()).optional(),
    }),
    output: MutationResultSchema,
    meta: {
      openapi: { method: 'PATCH', path: '/reviews/{reviewId}', protect: true, tags: ['reviews'] },
    },
  })
  async updateReview(
    @Input()
    input: {
      reviewId: string;
      notes: string;
      performance?: Performance;
      fps?: number | null;
      resolution?: string | null;
      softwareVersion?: string | null;
      screenshots?: string[];
    },
    @Ctx() ctx: SessionContext,
  ) {
    return this.reviewService.updateReview({
      userId: requireUserId(ctx),
      ...input,
    });
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      reviewId: z.string(),
      confirmation: z.boolean(),
    }),
    output: MutationResultSchema,
    meta: {
      openapi: { method: 'DELETE', path: '/reviews/{reviewId}', protect: true, tags: ['reviews'] },
    },
  })
  async deleteReview(
    @Input() input: { reviewId: string; confirmation: boolean },
    @Ctx() ctx: SessionContext,
  ) {
    return this.reviewService.deleteReview({
      userId: requireUserId(ctx),
      ...input,
    });
  }
}
