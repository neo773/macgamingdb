import { headers } from 'next/headers';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@macgamingdb/server/routers/_app';
import { createTRPCContext } from '@macgamingdb/server/trpc';
import superjson from 'superjson';

/**
 * Creates server-side helpers to use tRPC procedures inside server components
 * or inside getServerSideProps/getStaticProps
 */
export const createServerHelpers = async () => {
  const headersList = await headers();

  return createServerSideHelpers({
    router: appRouter,
    ctx: await createTRPCContext({
      req: new Request('http://localhost', {
        headers: headersList,
      }),
    }),
    transformer: superjson,
  });
};
