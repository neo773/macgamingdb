import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { createDrizzleClient } from 'macgamingdb-server/database';
import { BetterAuthClient } from 'macgamingdb-server/auth';
import { SteamOpenIdService } from 'macgamingdb-server/modules/library/drivers/steam/services/steam-openid.service';
import { getAppOrigin } from '@/modules/library/steam-connection/utils/getAppOrigin';
import { CALLBACK_PATH } from '@/modules/library/steam-connection/constants/CALLBACK_PATH';
import { STATE_COOKIE_NAME } from '@/modules/library/steam-connection/constants/STATE_COOKIE_NAME';
import { issueStateToken } from '@/modules/library/steam-connection/utils/issueStateToken';

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

  const state = await issueStateToken({ userId: session.user.id });
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
    new SteamOpenIdService().buildRedirectUrl({
      returnTo: returnTo.toString(),
      realm: `${origin}/`,
    }),
  );
}
