import { createDrizzleClient } from '@macgamingdb/server/database';
import { headers } from 'next/headers';
import { BetterAuthClient } from '@macgamingdb/server/auth';
import { redirect } from 'next/navigation';
import LibraryClient from './client';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const db = createDrizzleClient();
  const auth = await BetterAuthClient(db);
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/');
  }

  return <LibraryClient />;
}
