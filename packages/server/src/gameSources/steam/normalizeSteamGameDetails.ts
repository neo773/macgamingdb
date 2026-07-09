import type { SteamAppData } from '../../api/steam';
import type { NormalizedGameDetails } from '../NormalizedGameDetails';
import { extractReleaseYear } from '../../utils/extractReleaseYear';

export function normalizeSteamGameDetails(
  data: SteamAppData,
): NormalizedGameDetails {
  return {
    name: data.name,
    headerImage: data.header_image ?? null,
    descriptionHtml: data.detailed_description ?? null,
    developers: data.developers ?? [],
    publishers: data.publishers ?? [],
    website: data.website ?? null,
    releaseDate: data.release_date?.date ?? null,
    releaseYear: extractReleaseYear(data.release_date?.date) ?? null,
    genres: (data.genres ?? []).map((genre) => genre.description),
    screenshots: (data.screenshots ?? []).map(
      (screenshot) => screenshot.path_full,
    ),
    externalIds:
      data.steam_appid !== undefined && data.steam_appid !== null
        ? { steam: String(data.steam_appid) }
        : {},
  };
}
