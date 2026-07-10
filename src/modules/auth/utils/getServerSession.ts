import { headers } from 'next/headers';
import { BetterAuthClient } from 'macgamingdb-server/auth';
import { createDrizzleClient } from 'macgamingdb-server/database';

export const getServerSession = async () => {
  const db = createDrizzleClient();
  const auth = await BetterAuthClient(db);
  return auth.api.getSession({ headers: await headers() });
};
