import type { Metadata } from 'next';
import { createDrizzleClient } from '@macgamingdb/server/database';
import { headers } from 'next/headers';
import { BetterAuthClient } from '@macgamingdb/server/auth';
import { redirect } from 'next/navigation';
import LibraryClient from './client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Library',
  description:
    'Your linked Steam library — see which of your games run on Apple Silicon and how well they perform.',
};

export default async function LibraryPage() {
  const db = createDrizzleClient();
  const auth = await BetterAuthClient(db);
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/');
  }

  return <LibraryClient />;
}
