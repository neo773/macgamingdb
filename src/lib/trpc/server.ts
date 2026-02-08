import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@macgamingdb/server/routers/_app';
import { createTRPCContext } from '@macgamingdb/server/trpc';
import superjson from 'superjson';

/**
 * Creates server-side helpers to use tRPC procedures inside server components.
 * Does not forward request headers — only suitable for public procedures.
 * Auth-protected queries should go through the tRPC client (browser-side).
 */
export const createServerHelpers = async () => {
  return createServerSideHelpers({
    router: appRouter,
    ctx: await createTRPCContext(),
    transformer: superjson,
  });
};
