import { createAuthEndpoint } from 'better-auth/api';
import { type BetterAuthPlugin, type User } from 'better-auth';
import { setSessionCookie } from 'better-auth/cookies';
import { z } from 'zod';

const STEAM_BASE_URL = 'https://api.steampowered.com/';

export interface SteamAuthPluginOptions {
  steamApiKey: string;
}

export const steamAuthPlugin = (
  cfg: SteamAuthPluginOptions,
): BetterAuthPlugin => ({
  id: 'steam-auth',
  endpoints: {
    signInWithSteam: createAuthEndpoint(
      '/sign-in/steam',
      {
        method: 'POST',
        body: z.object({
          callbackURL: z.string().optional(),
          errorCallbackURL: z.string().optional(),
          newUserCallbackURL: z.string().optional(),
          disableRedirect: z.boolean().optional(),
        }),
      },
      async (ctx) => {
        const returnUrl = `${ctx.context.baseURL}/steam/callback`;
        const openidURL =
          `https://steamcommunity.com/openid/login?` +
          `openid.ns=${encodeURIComponent('http://specs.openid.net/auth/2.0')}&` +
          `openid.mode=checkid_setup&` +
          `openid.return_to=${encodeURIComponent(returnUrl)}&` +
          `openid.realm=${encodeURIComponent(ctx.context.baseURL)}&` +
          `openid.identity=${encodeURIComponent('http://specs.openid.net/auth/2.0/identifier_select')}&` +
          `openid.claimed_id=${encodeURIComponent('http://specs.openid.net/auth/2.0/identifier_select')}&`;

        return new Response(
          JSON.stringify({
            url: openidURL,
            redirect: !ctx.body.disableRedirect,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );
      },
    ),

    steamCallback: createAuthEndpoint(
      '/steam/callback',
      { method: 'GET' },
      async (ctx) => {
        if (!ctx?.request?.url) {
          return Response.redirect(
            `${`${ctx.context.baseURL}/error`}?error=missing_request_url`,
          );
        }

        const callbackUrl = new URL(ctx?.request?.url);
        const params = Object.fromEntries(callbackUrl.searchParams.entries());

        const verifyRes = await fetch(
          'https://steamcommunity.com/openid/login',
          {
            method: 'POST',
            body: new URLSearchParams({
              ...Object.fromEntries(callbackUrl.searchParams.entries()),
              'openid.mode': 'check_authentication',
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        const verifyText = await verifyRes.text();

        if (!verifyText.includes('is_valid:true')) {
          return Response.redirect(
            `${`${ctx.context.baseURL}/error`}?error=steam_openid_validation_failed`,
          );
        }

        const steamid = params['openid.claimed_id']?.split('/').pop();

        if (!steamid) {
          return Response.redirect(
            `${`${ctx.context.baseURL}/error`}?error=steamid_missing`,
          );
        }

        const profileUrl = new URL(
          `ISteamUser/GetPlayerSummaries/v0002/?key=${cfg.steamApiKey}&steamids=${steamid}`,
          STEAM_BASE_URL,
        );

        const profileRes = await fetch(profileUrl.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!profileRes.ok) {
          return Response.redirect(
            `${`${ctx.context.baseURL}/error`}?error=steam_profile_fetch_failed`,
          );
        }

        const profile = await profileRes.json();
        const steamUser = profile.response.players[0];

        let account = await ctx.context.internalAdapter.findAccount(steamid);

        let user: User | null = null;
        if (!account) {
          console.log('No account found for Steam ID, creating new account');
          user = await ctx.context.internalAdapter.createUser({
            name: steamUser?.personaname || 'Unknown',
            email: `${steamid}@placeholder.com`,
            emailVerified: false,
            image: steamUser?.avatarfull || '',
          });
          account = await ctx.context.internalAdapter.createAccount({
            accountId: steamid,
            providerId: 'steam',
            userId: user.id,
          });
        } else {
          user = await ctx.context.internalAdapter.findUserById(account.userId);
        }

        if (!user || !account) {
          return Response.redirect(
            `${`${ctx.context.baseURL}/error`}?error=user_or_account_not_found`,
          );
        }

        const session = await ctx.context.internalAdapter.createSession(
          user.id,
          ctx.request,
        );

        await setSessionCookie(ctx, {
          session,
          user,
        });

        const hostname = new URL(ctx.context.baseURL);
        const url = new URL('/my-reviews', hostname);
        console.log('Redirecting to:', url.toString());

        throw ctx.redirect(url.toString());
      },
    ),
  },
});