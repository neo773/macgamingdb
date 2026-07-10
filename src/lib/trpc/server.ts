import { createServerSideHelpers } from '@trpc/react-query/server';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { type AppRouter } from 'macgamingdb-server/generated';
import { headers } from 'next/headers';
import superjson from 'superjson';
import { getUrl } from '@/lib/trpc/utils';

/**
 * Creates server-side helpers to call the API server from server components.
 * Does not forward request headers — only suitable for public procedures.
 * Auth-protected queries should go through the tRPC client (browser-side).
 */
export const createServerHelpers = async () => {
  return createServerSideHelpers({
    client: createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: getUrl(),
          transformer: superjson,
        }),
      ],
    }),
  });
};

/**
 * Creates server-side helpers that forward the incoming request cookie to the
 * API server, so auth-protected procedures authenticate the current session.
 */
export const createServerHelpersWithAuth = async () => {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie') ?? '';

  return createServerSideHelpers({
    client: createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: getUrl(),
          transformer: superjson,
          headers: () => (cookie ? { cookie } : {}),
        }),
      ],
    }),
  });
};
