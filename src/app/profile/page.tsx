import { createDrizzleClient } from '@macgamingdb/server/database';
import { headers } from 'next/headers';
import { BetterAuthClient } from '@macgamingdb/server/auth';
import { redirect } from 'next/navigation';
import ProfileClient from './client';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const db = createDrizzleClient();
  const auth = await BetterAuthClient(db);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/');
  }

  return (
    <ProfileClient
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    />
  );
}
