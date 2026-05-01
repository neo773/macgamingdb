const STEAM_OPENID_ENDPOINT = 'https://steamcommunity.com/openid/login';
const STEAM_API_BASE = 'https://api.steampowered.com';
const CLAIMED_ID_PREFIX = 'https://steamcommunity.com/openid/id/';

export interface SteamOwnedGame {
  appid: number;
  name?: string;
  playtime_forever: number;
  img_icon_url?: string;
  has_community_visible_stats?: boolean;
}

export interface SteamOwnedGamesResult {
  steamId: string;
  games: SteamOwnedGame[];
}

export class SteamLibraryPrivateError extends Error {
  constructor() {
    super('STEAM_LIBRARY_PRIVATE');
    this.name = 'SteamLibraryPrivateError';
  }
}

export function buildSteamOpenIdRedirectUrl(returnTo: string, realm: string): string {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnTo,
    'openid.realm': realm,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });
  return `${STEAM_OPENID_ENDPOINT}?${params.toString()}`;
}

/**
 * Verify the OpenID 2.0 response from Steam by replaying the assertion back
 * to Steam with `openid.mode=check_authentication`. Returns the SteamID64 on
 * success, throws otherwise.
 */
export async function verifySteamOpenIdResponse(
  searchParams: URLSearchParams,
): Promise<string> {
  if (searchParams.get('openid.mode') !== 'id_res') {
    throw new Error('Invalid OpenID response mode');
  }

  const claimedId = searchParams.get('openid.claimed_id');
  if (!claimedId || !claimedId.startsWith(CLAIMED_ID_PREFIX)) {
    throw new Error('Invalid claimed_id');
  }

  const verifyParams = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('openid.')) verifyParams.set(key, value);
  }
  verifyParams.set('openid.mode', 'check_authentication');

  const res = await fetch(STEAM_OPENID_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: verifyParams.toString(),
  });
  const body = await res.text();
  if (!/is_valid\s*:\s*true/i.test(body)) {
    throw new Error('Steam rejected OpenID assertion');
  }

  const steamId = claimedId.slice(CLAIMED_ID_PREFIX.length);
  if (!/^\d{17}$/.test(steamId)) {
    throw new Error('Malformed SteamID64');
  }
  return steamId;
}

export async function getOwnedGames(steamId: string): Promise<SteamOwnedGamesResult> {
  const apiKey = process.env.STEAM_WEB_API_KEY;
  if (!apiKey) throw new Error('STEAM_WEB_API_KEY not configured');

  const url = new URL(`${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('steamid', steamId);
  url.searchParams.set('include_appinfo', '1');
  url.searchParams.set('include_played_free_games', '1');
  url.searchParams.set('format', 'json');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Steam API ${res.status}`);

  const json = (await res.json()) as { response?: { game_count?: number; games?: SteamOwnedGame[] } };

  if (!json.response || json.response.game_count === undefined) {
    throw new SteamLibraryPrivateError();
  }

  return { steamId, games: json.response.games ?? [] };
}
