import { Inject, Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import {
  TRPCMiddleware,
  MiddlewareOptions,
  MiddlewareResponse,
} from 'nestjs-trpc';
import type { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { BetterAuthClient } from '../../core-modules/auth/better-auth-client.util';
import { type DrizzleDB } from '../../../database/drizzle';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB) {}

  async use(
    opts: MiddlewareOptions<{ req: Request }>,
  ): Promise<MiddlewareResponse> {
    try {
      const auth = await BetterAuthClient(this.db);
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(opts.ctx.req.headers),
      });

      if (!session) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      return opts.next({ ctx: { user: session } });
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        cause:
          error instanceof Error ? error.message : 'Invalid or expired token',
        message: 'Invalid or expired token',
      });
    }
  }
}
