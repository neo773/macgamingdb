import { type NextRequest } from 'next/server';
import { createOpenApiFetchHandler } from 'trpc-to-openapi';
import { appRouter } from 'macgamingdb-server/routers/_app';
import { createDrizzleClient } from 'macgamingdb-server/database';

export const dynamic = 'force-dynamic';

const handler = (req: NextRequest) => {
  const db = createDrizzleClient();

  return createOpenApiFetchHandler({
    endpoint: '/api/rest',
    router: appRouter,
    createContext: () => ({ req, db }),
    req,
    onError: ({ path, error }) => {
      console.error(`Error in OpenAPI handler at ${path}: ${error.message}`);
    },
  });
};

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
};
