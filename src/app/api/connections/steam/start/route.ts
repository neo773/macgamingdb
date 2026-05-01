import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { createDrizzleClient } from '@macgamingdb/server/database';
import { BetterAuthClient } from '@macgamingdb/server/auth';
import { buildSteamOpenIdRedirectUrl } from '@macgamingdb/server/services/steam-openid';
import { getAppOrigin } from '@/lib/steam-openid/appOrigin';
import { CALLBACK_PATH } from '@/lib/steam-openid/callbackPath';
import { STATE_COOKIE_NAME } from '@/lib/steam-openid/stateCookieName';
import { issueStateToken } from '@/lib/steam-openid/stateToken';

export const dynamic = 'force-dynamic';

const STATE_TTL_SECONDS = 10 * 60;

export async function GET() {
  const db = createDrizzleClient();
  const auth = await BetterAuthClient(db);
  const session = await auth.api.getSession({ headers: await headers() });
  const origin = getAppOrigin();

  if (!session) {
    return NextResponse.redirect(`${origin}/`);
  }

  const state = await issueStateToken(session.user.id);
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: STATE_TTL_SECONDS,
  });

  const returnTo = new URL(CALLBACK_PATH, origin);
  returnTo.searchParams.set('state', state);

  return NextResponse.redirect(
    buildSteamOpenIdRedirectUrl(returnTo.toString(), `${origin}/`),
  );
}
