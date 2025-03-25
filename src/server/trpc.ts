import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import prisma from "@/lib/prisma";
import superjson from "superjson";

// Create context interface that can be used on both server and client
export interface TrpcContext {
  prisma: typeof prisma;
}

export const createTRPCContext = async (
  opts:
    | FetchCreateContextFnOptions
    | {
        prisma: typeof prisma;
      } = {
    prisma,
  }
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
