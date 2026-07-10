import { headers } from 'next/headers';
import { BetterAuthClient } from 'macgamingdb-server/auth';
import { createDrizzleClient } from 'macgamingdb-server/database';

/**
 * Resolves the current better-auth session from the incoming request.
 * Auth is Next-owned, so the session check stays out of the API server.
 */
export const getServerSession = async () => {
  const db = createDrizzleClient();
  const auth = await BetterAuthClient(db);
  return auth.api.getSession({ headers: await headers() });
};
