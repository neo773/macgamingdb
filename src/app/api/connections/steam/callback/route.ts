import { type NextRequest, NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { and, eq } from 'drizzle-orm';
import { createDrizzleClient } from 'macgamingdb-server/database';
import { BetterAuthClient } from 'macgamingdb-server/auth';
import {
  LibraryProvider,
  userExternalAccounts,
} from 'macgamingdb-server/drizzle/schema';
import { SteamOpenIdService } from 'macgamingdb-server/modules/library/drivers/steam/services/steam-openid.service';
import { SteamLibraryPrivateError } from 'macgamingdb-server/modules/library/drivers/steam/exceptions/steam-library-private.exception';
import { SteamLibrarySyncService } from 'macgamingdb-server/modules/library/drivers/steam/services/steam-library-sync.service';
import { SteamWebApiService } from 'macgamingdb-server/modules/library/drivers/steam/services/steam-web-api.service';
import { getAppOrigin } from '@/modules/library/steam-connection/utils/getAppOrigin';
import { STATE_COOKIE_NAME } from '@/modules/library/steam-connection/constants/STATE_COOKIE_NAME';
import { FLOW_ERROR } from '@/modules/library/steam-connection/constants/FLOW_ERROR';
import { type FlowError } from '@/modules/library/steam-connection/types/FlowError';
import { verifyStateToken } from '@/modules/library/steam-connection/utils/verifyStateToken';

export const dynamic = 'force-dynamic';

function libraryRedirect(error?: FlowError) {
  const url = new URL('/library', getAppOrigin());
  if (error) url.searchParams.set('error', error);
  return NextResponse.redirect(url);
}

async function consumeStateCookie(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(STATE_COOKIE_NAME)?.value ?? null;
  store.delete(STATE_COOKIE_NAME);
  return value;
}

async function upsertSteamLink(
  db: ReturnType<typeof createDrizzleClient>,
  userId: string,
  steamId: string,
) {
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
}

export async function GET(request: NextRequest) {
  const db = createDrizzleClient();
  const auth = await BetterAuthClient(db);
  const session = await auth.api.getSession({ headers: await headers() });
  const origin = getAppOrigin();

  if (!session) {
    return NextResponse.redirect(new URL('/', origin));
  }
  const userId = session.user.id;

  const cookieState = await consumeStateCookie();
  const queryState = request.nextUrl.searchParams.get('state');
  if (
    !cookieState ||
    !queryState ||
    cookieState !== queryState ||
    !(await verifyStateToken({ token: cookieState, expectedUserId: userId }))
  ) {
    return libraryRedirect(FLOW_ERROR.StateMismatch);
  }

  let steamId: string;
  try {
    steamId = await new SteamOpenIdService().verifyResponse({
      callbackUrl: request.nextUrl.toString(),
      realm: `${origin}/`,
    });
  } catch (error) {
    console.error('Steam OpenID verify failed:', error instanceof Error ? error.message : 'unknown');
    return libraryRedirect(FLOW_ERROR.VerifyFailed);
  }

  await upsertSteamLink(db, userId, steamId);

  try {
    await new SteamLibrarySyncService(db, new SteamWebApiService()).syncLibraryForUser({ userId });
  } catch (error) {
    if (error instanceof SteamLibraryPrivateError) {
      return libraryRedirect(FLOW_ERROR.PrivateLibrary);
    }
    console.error('Initial Steam library sync failed:', error instanceof Error ? error.message : 'unknown');
    return libraryRedirect(FLOW_ERROR.VerifyFailed);
  }

  return libraryRedirect();
}
