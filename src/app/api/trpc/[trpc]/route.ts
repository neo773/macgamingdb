import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@macgamingdb/server/routers/_app';
import { createPrismaClient } from '@macgamingdb/server/database';

const handler = (req: Request) => {
  const prisma = createPrismaClient();

  return fetchRequestHandler<typeof appRouter>({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({ req, prisma }),
    onError: ({ path, error }) => {
      console.error(`Error in tRPC handler at ${path}: ${error.message}`);
    },
  });
};

export { handler as GET, handler as POST };
