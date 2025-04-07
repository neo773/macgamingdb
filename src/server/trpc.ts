import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import { auth } from "@/lib/auth";
import { TRPCError } from "@trpc/server";

// Create context interface that can be used on both server and client
export interface TrpcContext {
  prisma: typeof prisma;
  req?: Request;
  user?: any; // User information when authenticated
}

export const createTRPCContext = async (
  opts: FetchCreateContextFnOptions
): Promise<TrpcContext> => {
  const req = opts.req;
  
  return {
    prisma,
    req,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const procedure = t.procedure;

// Middleware to check authentication
const isAuthed = t.middleware(async ({ ctx, next }) => {
  // const authHeader = ctx.req?.headers.get("authorization");
  
  // if (!authHeader) {
  //   throw new TRPCError({
  //     code: "UNAUTHORIZED",
  //     message: "Missing authorization header",
  //   });
  // }

  try {
    const authSession = await auth.api.getSession({
      headers: ctx?.req?.headers!
    })
    
    return next({
      ctx: {
        ...ctx,
        user: authSession,
      },
    });
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
});

// Use this procedure when authentication is required
export const protectedProcedure = t.procedure.use(isAuthed);
