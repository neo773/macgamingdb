import { initTRPC, TRPCError } from '@trpc/server';
import { type OpenApiMeta } from 'trpc-to-openapi';
import superjson from 'superjson';
import { BetterAuthClient } from '../engine/core-modules/auth/better-auth-client.util';
import { createDrizzleClient, type DrizzleDB } from '../database/drizzle';
import { type User } from 'better-auth';

export interface TrpcContext {
  db: DrizzleDB;
  req?: Request;
  user?: User;
}

export const createTRPCContext = async (
  opts: { req?: Request } = {},
): Promise<TrpcContext> => {
  const db = createDrizzleClient();
  return {
    db,
    req: opts.req,
  };
};

const t = initTRPC.context<TrpcContext>().meta<OpenApiMeta>().create({
  transformer: superjson,
});

export const router = t.router;
export const procedure = t.procedure;

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  try {
    if (!ctx.req) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Request object not available',
      });
    }

    const auth = await BetterAuthClient(ctx.db);
    const authSession = await auth.api.getSession({
      headers: ctx.req.headers,
    });

    return next({
      ctx: {
        ...ctx,
        user: authSession,
      },
    });
  } catch (error) {
    console.error(error);
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      cause:
        error instanceof Error ? error.message : 'Invalid or expired token',
      message: 'Invalid or expired token',
    });
  }
});

export const protectedProcedure = t.procedure.use(isAuthenticated);
