import { type SteamAppData } from '@macgamingdb/server/api/steam';

const DEFAULT_GAME_DETAILS: SteamAppData = {
  name: 'Game Information Unavailable',
  detailed_description:
    'Game details could not be loaded at this time. Please try again later.',
  header_image: '',
  release_date: { date: 'Unknown', coming_soon: false },
} as SteamAppData;

export function parseGameDetails(details: string | null): SteamAppData {
  try {
    return JSON.parse(details || '{}') as SteamAppData;
  } catch {
    return DEFAULT_GAME_DETAILS;
  }
}

export { DEFAULT_GAME_DETAILS };
