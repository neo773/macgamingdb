import { Inject } from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { Ctx, Input, Mutation, Router } from 'nestjs-trpc';
import { TrafficService } from '../services/traffic.service';

const firstHeaderValue = (value: string | string[] | undefined): string | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const resolveIpInfo = (request: Request | undefined): string => {
  if (!request) return 'Unknown';
  const cfConnectingIp = firstHeaderValue(request.headers['cf-connecting-ip']);
  const forwarded = firstHeaderValue(request.headers['x-forwarded-for']);
  const realIp = firstHeaderValue(request.headers['x-real-ip']);
  return cfConnectingIp || forwarded?.split(',')[0] || realIp || 'unknown';
};

@Router({ alias: 'traffic' })
export class TrafficRouter {
  constructor(
    @Inject(TrafficService) private readonly trafficService: TrafficService,
  ) {}

  @Mutation({
    input: z.object({
      source: z.string().min(1).max(200),
      userAgent: z.string().optional(),
    }),
  })
  async submitSource(
    @Input() input: { source: string; userAgent?: string },
    @Ctx() ctx: { req?: Request },
  ) {
    return this.trafficService.submitSource({
      source: input.source,
      userAgent: input.userAgent,
      ipInfo: resolveIpInfo(ctx.req),
    });
  }
}
