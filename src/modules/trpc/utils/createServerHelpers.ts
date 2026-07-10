import { createServerSideHelpers } from '@trpc/react-query/server';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { type AppRouter } from 'macgamingdb-server/generated';
import superjson from 'superjson';
import { getUrl } from '@/modules/trpc/utils/getUrl';

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
