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
import { SteamLibraryPrivateError } from '@macgamingdb/server/services/steam-api';
import { syncSteamLibraryForUser } from '@macgamingdb/server/services/steam-library';
import { getAppOrigin } from '@/lib/steam-openid/appOrigin';
import { STATE_COOKIE_NAME } from '@/lib/steam-openid/stateCookieName';
import { FLOW_ERROR, type FlowError } from '@/lib/steam-openid/flowError';
import { verifyStateToken } from '@/lib/steam-openid/stateToken';

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

export async function GET(req: NextRequest) {
  const db = createDrizzleClient();
  const auth = await BetterAuthClient(db);
  const session = await auth.api.getSession({ headers: await headers() });
  const origin = getAppOrigin();

  if (!session) {
    return NextResponse.redirect(new URL('/', origin));
  }
  const userId = session.user.id;

  const cookieState = await consumeStateCookie();
  const queryState = req.nextUrl.searchParams.get('state');
  if (
    !cookieState ||
    !queryState ||
    cookieState !== queryState ||
    !(await verifyStateToken(cookieState, userId))
  ) {
    return libraryRedirect(FLOW_ERROR.StateMismatch);
  }

  let steamId: string;
  try {
    steamId = await verifySteamOpenIdResponse(req.nextUrl.toString(), `${origin}/`);
  } catch (err) {
    console.error('Steam OpenID verify failed:', err instanceof Error ? err.message : 'unknown');
    return libraryRedirect(FLOW_ERROR.VerifyFailed);
  }

  await upsertSteamLink(db, userId, steamId);

  try {
    await syncSteamLibraryForUser(db, userId);
  } catch (err) {
    if (err instanceof SteamLibraryPrivateError) {
      return libraryRedirect(FLOW_ERROR.PrivateLibrary);
    }
    console.error('Initial Steam library sync failed:', err instanceof Error ? err.message : 'unknown');
    return libraryRedirect(FLOW_ERROR.VerifyFailed);
  }

  return libraryRedirect();
}
