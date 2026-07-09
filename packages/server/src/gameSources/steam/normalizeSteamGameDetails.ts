import type { SteamAppData } from '../../api/steam';
import type { NormalizedGameDetails } from '../NormalizedGameDetails';
import { extractReleaseYear } from '../../utils/extractReleaseYear';

export function normalizeSteamGameDetails(
  data: SteamAppData,
): NormalizedGameDetails {
  return {
    source: 'steam',
    name: data.name,
    headerImage: data.header_image ?? null,
    descriptionHtml: data.detailed_description ?? null,
    developers: data.developers ?? [],
    publishers: data.publishers ?? [],
    website: data.website ?? null,
    steamAppId:
      data.steam_appid !== undefined && data.steam_appid !== null
        ? String(data.steam_appid)
        : null,
    releaseDate: data.release_date?.date ?? null,
    releaseYear: extractReleaseYear(data.release_date?.date) ?? null,
    genres: (data.genres ?? []).map((genre) => genre.description),
    screenshots: (data.screenshots ?? []).map(
      (screenshot) => screenshot.path_full,
    ),
  };
}
