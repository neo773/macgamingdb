import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createPrismaClient } from "@/lib/prisma";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const handler = (req: Request) => {
  const prisma = createPrismaClient(
    process.env.NODE_ENV === "production"
      ? new PrismaLibSQL({
          url: `${process.env.LIBSQL_DATABASE_URL}`,
          authToken: `${process.env.LIBSQL_DATABASE_TOKEN}`,
        })
      : undefined,
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
