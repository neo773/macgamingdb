import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/lib/auth/auth";
import { TRPCError } from "@trpc/server";
import { createPrismaClient } from "@/lib/database/prisma";
import { PrismaClient } from "@prisma/client";
import { User } from "better-auth";

// Define a proper context type
export interface TrpcContext {
  prisma: PrismaClient;
  req?: Request;
  user?: User;
}

// Create context for API route handler
export const createTRPCContext = async (
  opts: { req?: Request } = {},
): Promise<TrpcContext> => {

  const prisma = createPrismaClient();
  return {
    prisma: prisma,
    req: opts.req,
  };
};

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const procedure = t.procedure;

// Middleware to check authentication
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  try {
    if (!ctx.req) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Request object not available",
      });
    }

    const authSession = await auth(ctx.prisma!).api.getSession({
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
      code: "UNAUTHORIZED",
      cause: error instanceof Error ? error.message : "Invalid or expired token",
      message: "Invalid or expired token",
    });
  }
});

// Use this procedure when authentication is required
export const protectedProcedure = t.procedure.use(isAuthenticated);
