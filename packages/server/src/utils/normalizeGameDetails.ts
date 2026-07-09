import type { SteamAppData } from '../api/steam';
import type { IGDBGameData } from '../api/igdb';
import type { NormalizedGameDetails } from '../gameSources/NormalizedGameDetails';
import { normalizeSteamGameDetails } from '../gameSources/steam/normalizeSteamGameDetails';
import { normalizeIgdbGameDetails } from '../gameSources/igdb/normalizeIgdbGameDetails';

export function normalizeGameDetails(
  source: string,
  detailsJson: string | null,
): NormalizedGameDetails | null {
  if (!detailsJson) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(detailsJson);
  } catch {
    return null;
  }

  if (parsed === null || typeof parsed !== 'object') {
    return null;
  }

  return source === 'igdb'
    ? normalizeIgdbGameDetails(parsed as IGDBGameData)
    : normalizeSteamGameDetails(parsed as SteamAppData);
}
