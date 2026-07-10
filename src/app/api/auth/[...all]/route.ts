import { BetterAuthClient } from 'macgamingdb-server/auth';
import { createDrizzleClient } from 'macgamingdb-server/database';
import { toNextJsHandler } from 'better-auth/next-js';

export const GET = async (request: Request) => {
  const db = createDrizzleClient();
  const auth = await BetterAuthClient(db);
  return toNextJsHandler(auth).GET(request);
};

export const POST = async (request: Request) => {
  const db = createDrizzleClient();
  const auth = await BetterAuthClient(db);
  return toNextJsHandler(auth).POST(request);
};
