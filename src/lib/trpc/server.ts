import { headers } from 'next/headers';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@/server/routers/_app';
import { createTRPCContext } from '@/server/trpc';
import superjson from 'superjson';

/**
 * Creates server-side helpers to use tRPC procedures inside server components
 * or inside getServerSideProps/getStaticProps
 */
export async function createServerHelpers() {
  const headersList = headers();

  return createServerSideHelpers({
    router: appRouter,
    ctx: await createTRPCContext({
      req: new Request('http://localhost', {
        headers: await headersList,
      }),
    }),
    transformer: superjson,
  });
}
