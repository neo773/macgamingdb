import { Inject } from '@nestjs/common';
import { z } from 'zod';
import { Ctx, Input, Mutation, Router, UseMiddlewares } from 'nestjs-trpc';
import { AuthMiddleware } from '../../../engine/api/trpc/auth.middleware';
import { requireUserIdOrThrow } from '../../../engine/api/trpc/require-user-id.util';
import { type SessionContext } from '../../../engine/api/trpc/session-context.type';
import {
  ReportReasonSchema,
  type ReportReason,
} from '../dtos/report-reason.dto';
import { ReportResultSchema } from '../dtos/report-result.dto';
import { ReportService } from '../services/report.service';

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
      reporterUserId: requireUserIdOrThrow(ctx),
      ...input,
    });
  }
}
