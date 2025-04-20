import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { createPrismaClient } from "@/lib/prisma";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
// import { getCloudflareContext } from "@opennextjs/cloudflare";
// import { PrismaD1 } from "adapter-d1-patched";

// Define a proper context type
export interface TrpcContext {
  prisma: typeof prisma;
  req?: Request;
  user?: any;
}

// Create context for API route handler
export const createTRPCContext = async (
  opts: { req?: Request } = {}
): Promise<TrpcContext> => {
  // const DB = getCloudflareContext().env.DB;

  // const prisma = createPrismaClient(
  //   process.env.NODE_ENV === "production" ? new PrismaD1(DB) : undefined
  // );

  const prisma = createPrismaClient(
    process.env.NODE_ENV === "production"
      ? new PrismaLibSQL({
          url: `${process.env.TURSO_DATABASE_URL}`,
          authToken: `${process.env.TURSO_AUTH_TOKEN}`,
        })
      : undefined
  );
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
const isAuthed = t.middleware(async ({ ctx, next }) => {
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
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
});

// Use this procedure when authentication is required
export const protectedProcedure = t.procedure.use(isAuthed);
