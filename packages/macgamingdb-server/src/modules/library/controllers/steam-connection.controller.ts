import { Controller, Get, Inject, Query, Req, Res } from '@nestjs/common';
import { type Request, type Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { BetterAuthClient } from '../../../engine/core-modules/auth/better-auth-client.util';
import { STEAM_APP_REDIRECT_SCHEME } from '../drivers/steam/constants/steam-app-redirect-scheme.constant';
import { STEAM_BROWSER_FLOW_ERROR } from '../drivers/steam/constants/steam-browser-flow-error.constant';
import { STEAM_LINK_OUTCOME } from '../drivers/steam/constants/steam-link-outcome.constant';
import { STEAM_STATE_COOKIE_NAME } from '../drivers/steam/constants/steam-state-cookie-name.constant';
import { STEAM_STATE_TTL_SECONDS } from '../drivers/steam/constants/steam-state-ttl-seconds.constant';
import { type SteamLinkOutcome } from '../drivers/steam/types/steam-link-outcome.type';
import { buildSteamCallbackUrl } from '../drivers/steam/utils/build-steam-callback-url.util';
import { getAppOrigin } from '../drivers/steam/utils/get-app-origin.util';
import { readSteamStateCookie } from '../drivers/steam/utils/read-steam-state-cookie.util';
import { verifyStateToken } from '../drivers/steam/utils/verify-state-token.util';
import { verifyStateTokenUserId } from '../drivers/steam/utils/verify-state-token-user-id.util';
import { LibraryService } from '../services/library.service';

@Controller('connections/steam')
export class SteamConnectionController {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB,
    private readonly libraryService: LibraryService,
  ) {}

  @Get('start')
  async start(@Req() request: Request, @Res() response: Response) {
    const origin = getAppOrigin();
    const userId = await this.resolveSessionUserId(request);

    if (!isDefined(userId)) {
      return response.redirect(`${origin}/`);
    }

    const { state, url } = await this.libraryService.browserLinkStartUrl(userId);

    response.cookie(STEAM_STATE_COOKIE_NAME, state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: STEAM_STATE_TTL_SECONDS * 1000,
    });

    return response.redirect(url);
  }

  @Get('callback')
  async callback(
    @Req() request: Request,
    @Res() response: Response,
    @Query('state') queryState?: string,
  ) {
    const origin = getAppOrigin();
    const userId = await this.resolveSessionUserId(request);

    if (!isDefined(userId)) {
      return response.redirect(`${origin}/`);
    }

    const cookieState = readSteamStateCookie({
      cookieHeader: request.headers.cookie,
    });
    response.clearCookie(STEAM_STATE_COOKIE_NAME, { path: '/' });

    const hasMatchingState =
      isNonEmptyString(cookieState) &&
      isNonEmptyString(queryState) &&
      cookieState === queryState &&
      (await verifyStateToken({ token: cookieState, expectedUserId: userId }));

    if (!hasMatchingState) {
      return this.redirectToLibrary({
        response,
        origin,
        error: STEAM_BROWSER_FLOW_ERROR.StateMismatch,
      });
    }

    const outcome = await this.libraryService.completeSteamLink({
      userId,
      callbackUrl: buildSteamCallbackUrl({
        requestUrl: request.originalUrl,
        origin,
      }),
    });

    if (outcome === STEAM_LINK_OUTCOME.Ok) {
      return this.redirectToLibrary({ response, origin });
    }

    return this.redirectToLibrary({
      response,
      origin,
      error:
        outcome === STEAM_LINK_OUTCOME.LibraryPrivate
          ? STEAM_BROWSER_FLOW_ERROR.PrivateLibrary
          : STEAM_BROWSER_FLOW_ERROR.VerifyFailed,
    });
  }

  @Get('app-callback')
  async appCallback(
    @Req() request: Request,
    @Res() response: Response,
    @Query('state') state?: string,
  ) {
    if (!isNonEmptyString(state)) {
      return this.redirectToApp({
        response,
        outcome: STEAM_LINK_OUTCOME.StateMissing,
      });
    }

    const userId = await verifyStateTokenUserId({ token: state });

    if (!isDefined(userId)) {
      return this.redirectToApp({
        response,
        outcome: STEAM_LINK_OUTCOME.StateInvalid,
      });
    }

    const outcome = await this.libraryService.completeSteamLink({
      userId,
      callbackUrl: buildSteamCallbackUrl({
        requestUrl: request.originalUrl,
        origin: getAppOrigin(),
      }),
    });

    return this.redirectToApp({ response, outcome });
  }

  private async resolveSessionUserId(
    request: Request,
  ): Promise<string | undefined> {
    const auth = await BetterAuthClient(this.db);
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    return session?.user.id;
  }

  private redirectToLibrary({
    response,
    origin,
    error,
  }: {
    response: Response;
    origin: string;
    error?: string;
  }) {
    const url = new URL('/library', origin);

    if (isDefined(error)) {
      url.searchParams.set('error', error);
    }

    return response.redirect(url.toString());
  }

  private redirectToApp({
    response,
    outcome,
  }: {
    response: Response;
    outcome: SteamLinkOutcome;
  }) {
    const url = new URL(STEAM_APP_REDIRECT_SCHEME);
    const isOk = outcome === STEAM_LINK_OUTCOME.Ok;

    url.searchParams.set('status', isOk ? 'ok' : 'error');

    if (!isOk) {
      url.searchParams.set('error', outcome);
    }

    return response.redirect(url.toString());
  }
}
