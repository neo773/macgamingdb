const STEAM_API_BASE = 'https://api.steampowered.com';

export const STEAM_LIBRARY_PRIVATE_CODE = 'STEAM_LIBRARY_PRIVATE';

export interface SteamOwnedGame {
  appid: number;
  name?: string;
  playtime_forever: number;
  img_icon_url?: string;
  has_community_visible_stats?: boolean;
}

export class SteamLibraryPrivateError extends Error {
  constructor() {
    super(STEAM_LIBRARY_PRIVATE_CODE);
    this.name = 'SteamLibraryPrivateError';
  }
}

export async function getOwnedGames(steamId: string): Promise<SteamOwnedGame[]> {
  const apiKey = process.env.STEAM_WEB_API_KEY;
  if (!apiKey) throw new Error('STEAM_WEB_API_KEY not configured');

  const url = new URL(`${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('steamid', steamId);
  url.searchParams.set('include_appinfo', '1');
  url.searchParams.set('include_played_free_games', '1');
  url.searchParams.set('format', 'json');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Steam GetOwnedGames returned ${res.status}`);

  const json = (await res.json()) as {
    response?: { game_count?: number; games?: SteamOwnedGame[] };
  };

  if (!json.response || json.response.game_count === undefined) {
    throw new SteamLibraryPrivateError();
  }

  return json.response.games ?? [];
}
