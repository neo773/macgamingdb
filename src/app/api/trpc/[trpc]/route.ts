import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createPrismaClient } from "@/lib/prisma";
import { PrismaD1 } from "@prisma/adapter-d1";

const handler = (req: Request) => {
  const DB = getCloudflareContext().env.DB;

  const prisma = createPrismaClient(
    process.env.NODE_ENV === "production" ? new PrismaD1(DB) : undefined
  );

  return fetchRequestHandler<typeof appRouter>({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({ req, prisma }),
    onError: ({ path, error }) => {
      console.error(`Error in tRPC handler at ${path}: ${error.message}`);
    },
  });
};

export { handler as GET, handler as POST };
