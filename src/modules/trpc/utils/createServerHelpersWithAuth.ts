import { createServerSideHelpers } from '@trpc/react-query/server';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { type AppRouter } from 'macgamingdb-server/generated';
import { headers } from 'next/headers';
import superjson from 'superjson';
import { getUrl } from '@/modules/trpc/utils/getUrl';

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
