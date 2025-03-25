import { initTRPC } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import prisma from '@/lib/prisma';
import superjson from 'superjson';

// Create context interface that can be used on both server and client
export interface TrpcContext {
  headers?: Record<string, string | string[]>;
  cookies?: Record<string, string>;
  prisma: typeof prisma;
}

export const createTRPCContext = async (
  opts: FetchCreateContextFnOptions | { headers?: Record<string, string | string[]>; cookies?: Record<string, string> } = {}
): Promise<TrpcContext> => {
  return {
    prisma,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const procedure = t.procedure; 