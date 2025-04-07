import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import prisma from '@/lib/prisma';

const handler = (req: Request) => {
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