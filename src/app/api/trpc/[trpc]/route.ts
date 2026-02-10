import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@macgamingdb/server/routers/_app';
import { createDrizzleClient } from '@macgamingdb/server/database';

const handler = (req: Request) => {
  const db = createDrizzleClient();

  return fetchRequestHandler<typeof appRouter>({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({ req, db }),
    onError: ({ path, error }) => {
      console.error(`Error in tRPC handler at ${path}: ${error.message}`);
    },
  });
};

export { handler as GET, handler as POST };
