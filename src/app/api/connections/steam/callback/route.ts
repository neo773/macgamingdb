import { type NextRequest, NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { and, eq } from 'drizzle-orm';
import { createDrizzleClient } from '@macgamingdb/server/database';
import { BetterAuthClient } from '@macgamingdb/server/auth';
import {
  LibraryProvider,
  userExternalAccounts,
} from '@macgamingdb/server/drizzle/schema';
import { verifySteamOpenIdResponse } from '@macgamingdb/server/services/steam-openid';
import { syncSteamLibraryForUser } from '@macgamingdb/server/services/steam-library';
import { getPublicOrigin } from '@/lib/connections/origin';

export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'steam_openid_state';

function libraryUrl(error?: string): URL {
  const url = new URL('/library', getPublicOrigin());
  if (error) url.searchParams.set('error', error);
  return url;
}

export async function GET(req: NextRequest) {
  const db = createDrizzleClient();
  const auth = await BetterAuthClient(db);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.redirect(new URL('/', getPublicOrigin()));
  }
  const userId = session.user.id;

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  const incomingState = req.nextUrl.searchParams.get('state');
  cookieStore.delete(STATE_COOKIE);
  if (!expectedState || expectedState !== incomingState) {
    return NextResponse.redirect(libraryUrl('state_mismatch'));
  }

  let steamId: string;
  try {
    steamId = await verifySteamOpenIdResponse(req.nextUrl.searchParams);
  } catch (err) {
    console.error('Steam OpenID verify failed', err);
    return NextResponse.redirect(libraryUrl('verify_failed'));
  }

  const existing = await db.query.userExternalAccounts.findFirst({
    where: and(
      eq(userExternalAccounts.userId, userId),
      eq(userExternalAccounts.provider, LibraryProvider.STEAM),
    ),
  });

  if (existing) {
    await db
      .update(userExternalAccounts)
      .set({ externalUserId: steamId })
      .where(eq(userExternalAccounts.id, existing.id));
  } else {
    await db.insert(userExternalAccounts).values({
      userId,
      provider: LibraryProvider.STEAM,
      externalUserId: steamId,
    });
  }

  try {
    await syncSteamLibraryForUser(db, userId);
  } catch (err) {
    console.error('Initial Steam library sync failed', err);
    return NextResponse.redirect(libraryUrl('private_library'));
  }

  return NextResponse.redirect(libraryUrl());
}
