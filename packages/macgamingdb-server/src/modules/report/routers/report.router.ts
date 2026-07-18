import { Inject } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Ctx, Input, Mutation, Router, UseMiddlewares } from 'nestjs-trpc';
import { AuthMiddleware } from '../../../engine/api/trpc/auth.middleware';
import {
  ReportReasonSchema,
  type ReportReason,
} from '../dtos/report-reason.dto';
import { ReportResultSchema } from '../dtos/report-result.dto';
import { ReportService } from '../services/report.service';

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

@Router({ alias: 'report' })
export class ReportRouter {
  constructor(
    @Inject(ReportService) private readonly reportService: ReportService,
  ) {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      reviewId: z.string(),
      reason: ReportReasonSchema.optional(),
      note: z.string().max(500).optional(),
    }),
    output: ReportResultSchema,
    meta: {
      openapi: {
        method: 'POST',
        path: '/reports',
        protect: true,
        tags: ['reports'],
      },
    },
  })
  async create(
    @Input()
    input: { reviewId: string; reason?: ReportReason; note?: string },
    @Ctx() ctx: SessionContext,
  ) {
    return this.reportService.reportReview({
      reporterUserId: requireUserId(ctx),
      ...input,
    });
  }
}
