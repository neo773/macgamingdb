const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_API_BASE_URL = 'https://api.igdb.com/v4';
const TOKEN_REFRESH_MARGIN_MS = 60_000;
const RATE_LIMIT_INTERVAL_MS = 300;

const GAME_FIELDS = [
  'id',
  'name',
  'slug',
  'summary',
  'storyline',
  'first_release_date',
  'cover.id',
  'cover.image_id',
  'screenshots.image_id',
  'genres.id',
  'genres.name',
  'platforms.id',
  'platforms.name',
  'platforms.abbreviation',
  'involved_companies.company.name',
  'involved_companies.developer',
  'involved_companies.publisher',
  'websites.url',
  'websites.category',
  'external_games.category',
  'external_games.external_game_source',
  'external_games.uid',
  'total_rating',
  'videos.video_id',
].join(',');

// IGDB is migrating external_games.category to external_game_source; both use
// the value 1 for Steam, but only external_game_source is filterable now.
const EXTERNAL_GAME_SOURCE_STEAM = 1;

// Main games, standalone expansions, remakes, remasters, expanded games, and
// ports — everything a player would call "a game", excluding DLC and updates.
const SEARCHABLE_GAME_TYPES = [0, 4, 8, 9, 10, 11];

export interface IGDBGameData {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  first_release_date?: number;
  cover?: {
    id: number;
    image_id: string;
  };
  screenshots?: Array<{
    image_id: string;
  }>;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  platforms?: Array<{
    id: number;
    name: string;
    abbreviation?: string;
  }>;
  involved_companies?: Array<{
    company: {
      name: string;
    };
    developer: boolean;
    publisher: boolean;
  }>;
  websites?: Array<{
    url: string;
    category: number;
  }>;
  external_games?: Array<{
    category?: number;
    external_game_source?: number;
    uid: string;
  }>;
  total_rating?: number;
  videos?: Array<{
    video_id: string;
  }>;
}

interface TwitchAccessToken {
  accessToken: string;
  expiresAt: number;
}

let cachedAccessToken: TwitchAccessToken | null = null;
let rateLimitChain: Promise<void> = Promise.resolve();

async function requestTwitchAccessToken(): Promise<string> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET environment variable',
    );
  }

  const url =
    `${TWITCH_TOKEN_URL}?client_id=${encodeURIComponent(clientId)}` +
    `&client_secret=${encodeURIComponent(clientSecret)}` +
    `&grant_type=client_credentials`;

  const response = await fetch(url, { method: 'POST' });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to obtain Twitch access token (${response.status}): ${errorText}`,
    );
  }

  const body = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedAccessToken = {
    accessToken: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  };

  return body.access_token;
}

async function getTwitchAccessToken(): Promise<string> {
  if (
    cachedAccessToken &&
    Date.now() < cachedAccessToken.expiresAt - TOKEN_REFRESH_MARGIN_MS
  ) {
    return cachedAccessToken.accessToken;
  }

  return requestTwitchAccessToken();
}

function waitForRateLimitSlot(): Promise<void> {
  const previous = rateLimitChain;
  rateLimitChain = previous.then(
    () => new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_INTERVAL_MS)),
  );
  return previous;
}

async function performIGDBRequest(
  endpoint: string,
  query: string,
  accessToken: string,
): Promise<Response> {
  const clientId = process.env.TWITCH_CLIENT_ID;

  if (!clientId) {
    throw new Error('Missing TWITCH_CLIENT_ID environment variable');
  }

  return fetch(`${IGDB_API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    body: query,
  });
}

async function queryIGDB<ResultType>(
  endpoint: string,
  query: string,
): Promise<ResultType> {
  await waitForRateLimitSlot();

  let accessToken = await getTwitchAccessToken();
  let response = await performIGDBRequest(endpoint, query, accessToken);

  if (response.status === 401) {
    cachedAccessToken = null;
    accessToken = await requestTwitchAccessToken();
    await waitForRateLimitSlot();
    response = await performIGDBRequest(endpoint, query, accessToken);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `IGDB request to "${endpoint}" failed (${response.status}): ${errorText}`,
    );
  }

  return (await response.json()) as ResultType;
}

function escapeQueryValue(value: string): string {
  return value.replace(/"/g, '\\"');
}

export async function searchIGDBGames(
  query: string,
  limit = 20,
): Promise<IGDBGameData[]> {
  const apicalypseQuery =
    `search "${escapeQueryValue(query)}";` +
    ` fields ${GAME_FIELDS};` +
    ` where version_parent = null & game_type = (${SEARCHABLE_GAME_TYPES.join(',')});` +
    ` limit ${limit};`;

  return queryIGDB<IGDBGameData[]>('games', apicalypseQuery);
}

export async function getIGDBGameBySlug(
  slug: string,
): Promise<IGDBGameData | null> {
  const apicalypseQuery =
    `fields ${GAME_FIELDS};` +
    ` where slug = "${escapeQueryValue(slug)}";` +
    ` limit 1;`;

  const games = await queryIGDB<IGDBGameData[]>('games', apicalypseQuery);
  return games[0] ?? null;
}

export async function getIGDBGameById(
  id: number,
): Promise<IGDBGameData | null> {
  const apicalypseQuery =
    `fields ${GAME_FIELDS};` + ` where id = ${id};` + ` limit 1;`;

  const games = await queryIGDB<IGDBGameData[]>('games', apicalypseQuery);
  return games[0] ?? null;
}

export async function getIGDBGameBySteamAppId(
  steamAppId: string,
): Promise<IGDBGameData | null> {
  const gameFields = GAME_FIELDS.split(',')
    .map((field) => `game.${field}`)
    .join(',');

  const apicalypseQuery =
    `fields ${gameFields};` +
    ` where uid = "${escapeQueryValue(steamAppId)}"` +
    ` & external_game_source = ${EXTERNAL_GAME_SOURCE_STEAM};` +
    ` limit 1;`;

  const externalGames = await queryIGDB<Array<{ game?: IGDBGameData }>>(
    'external_games',
    apicalypseQuery,
  );

  return externalGames[0]?.game ?? null;
}

export function getSteamAppIdFromIGDB(game: IGDBGameData): string | null {
  const steamExternalGame = game.external_games?.find(
    (externalGame) =>
      externalGame.external_game_source === EXTERNAL_GAME_SOURCE_STEAM ||
      externalGame.category === EXTERNAL_GAME_SOURCE_STEAM,
  );

  return steamExternalGame?.uid ?? null;
}

export function igdbImageUrl(
  imageId: string,
  size: 't_cover_big' | 't_screenshot_big' | 't_720p' | 't_1080p' = 't_cover_big',
): string {
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
}
