import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/lib/auth";
import { TRPCError } from "@trpc/server";

// Define a proper context type
export interface TrpcContext {
  prisma: typeof prisma;
  req?: Request;
  user?: any;
}

// Create context for API route handler
export const createTRPCContext = async (opts: { req?: Request } = {}): Promise<TrpcContext> => {
  return {
    prisma,
    req: opts.req,
  };
};

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const procedure = t.procedure;

// Middleware to check authentication
const isAuthed = t.middleware(async ({ ctx, next }) => {
  try {
    if (!ctx.req) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Request object not available",
      });
    }

    const authSession = await auth(ctx.prisma!).api.getSession({
      headers: ctx.req.headers
    });
    
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
