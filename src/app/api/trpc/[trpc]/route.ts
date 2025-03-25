import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createTRPCContext } from '@/server/trpc';
import prisma from '@/lib/prisma';
const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => 
      createTRPCContext({
        prisma: prisma,
      }),
    onError: ({ path, error }) => {
      console.error(`Error in tRPC handler at ${path}: ${error.message}`);
    },
  });
};

export { handler as GET, handler as POST }; 