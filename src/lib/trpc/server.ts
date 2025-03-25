import { cookies, headers } from 'next/headers';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@/server/routers/_app';
import { createTRPCContext } from '@/server/trpc';
import superjson from 'superjson';

/**
 * Creates server-side helpers to use tRPC procedures inside server components
 * or inside getServerSideProps/getStaticProps
 */
export function createServerHelpers() {
  const headersData = headers();
  const cookiesData = cookies();
  
  return createServerSideHelpers({
    router: appRouter,
    ctx: createTRPCContext({
      headers: Object.fromEntries(headersData.entries()),
      cookies: Object.fromEntries(
        cookiesData.getAll().map((c) => [c.name, c.value])
      ),
    }),
    transformer: superjson,
  });
}