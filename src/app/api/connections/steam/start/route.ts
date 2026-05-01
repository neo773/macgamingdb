import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { createDrizzleClient } from '@macgamingdb/server/database';
import { BetterAuthClient } from '@macgamingdb/server/auth';
import { buildSteamOpenIdRedirectUrl } from '@macgamingdb/server/services/steam-openid';
import { getPublicOrigin } from '@/lib/connections/origin';

export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'steam_openid_state';

export async function GET() {
  const db = createDrizzleClient();
  const auth = await BetterAuthClient(db);
  const session = await auth.api.getSession({ headers: await headers() });
  const origin = getPublicOrigin();

  if (!session) {
    return NextResponse.redirect(`${origin}/`);
  }

  const state = randomBytes(16).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  });

  const returnTo = new URL('/api/connections/steam/callback', origin);
  returnTo.searchParams.set('state', state);

  const redirectUrl = buildSteamOpenIdRedirectUrl(returnTo.toString(), `${origin}/`);
  return NextResponse.redirect(redirectUrl);
}
