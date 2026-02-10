import { BetterAuthClient } from '@macgamingdb/server/auth';
import { createDrizzleClient } from '@macgamingdb/server/database';
import { toNextJsHandler } from 'better-auth/next-js';

export const GET = async (req: Request) => {
  const db = createDrizzleClient();
  return toNextJsHandler(BetterAuthClient(db)).GET(req);
};

export const POST = async (req: Request) => {
  const db = createDrizzleClient();
  return toNextJsHandler(BetterAuthClient(db)).POST(req);
};
