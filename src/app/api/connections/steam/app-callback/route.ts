import { type NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { createDrizzleClient } from 'macgamingdb-server/database';
import {
  LibraryProvider,
  userExternalAccounts,
} from 'macgamingdb-server/drizzle/schema';
import { verifySteamOpenIdResponse } from 'macgamingdb-server/services/steam-openid';
import { verifyStateTokenUserId } from 'macgamingdb-server/services/steam-openid-state';
import { SteamLibraryPrivateError } from 'macgamingdb-server/services/steam-api';
import { syncSteamLibraryForUser } from 'macgamingdb-server/services/steam-library';
import { getAppOrigin } from '@/lib/steam-openid/appOrigin';

export const dynamic = 'force-dynamic';

// Steam OpenID callback for the iOS app. Unlike the web callback this is
// cookie-free: the user is recovered from the signed state token the app
// minted via /api/rest/library/link-url, and the result is delivered through
// a custom-scheme redirect that ASWebAuthenticationSession intercepts.

const APP_REDIRECT_SCHEME = 'macgamingdb://steam-link';

function appRedirect(status: 'ok' | 'error', error?: string) {
  const url = new URL(APP_REDIRECT_SCHEME);
  url.searchParams.set('status', status);
  if (error) url.searchParams.set('error', error);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get('state');
  if (!state) {
    return appRedirect('error', 'state-missing');
  }

  const userId = await verifyStateTokenUserId(state);
  if (!userId) {
    return appRedirect('error', 'state-invalid');
  }

  let steamId: string;
  try {
    steamId = await verifySteamOpenIdResponse(req.url, `${getAppOrigin()}/`);
  } catch (error) {
    console.error('Steam OpenID verification failed (app flow):', error);
    return appRedirect('error', 'openid-failed');
  }

  const db = createDrizzleClient();

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
  } catch (error) {
    if (error instanceof SteamLibraryPrivateError) {
      return appRedirect('error', 'library-private');
    }
    console.error('Steam library sync failed (app flow):', error);
    return appRedirect('error', 'sync-failed');
  }

  return appRedirect('ok');
}
