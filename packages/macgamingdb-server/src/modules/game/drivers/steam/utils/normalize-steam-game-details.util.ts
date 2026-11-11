import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { normalizeGenres } from 'macgamingdb-shared/utils/normalizeGenres';
import { deriveGenresFromSteamTags } from 'macgamingdb-shared/utils/deriveGenresFromSteamTags';

import { extractReleaseYear } from '../../../utils/extract-release-year.util';
import type { NormalizedGameDetails } from '../../../types/normalized-game-details.type';
import type { SteamAppData } from '../types/steam-app-data.type';

type NormalizeSteamGameDetailsParams = {
  appData: SteamAppData;
  tagVotes: Record<string, number>;
};

export const normalizeSteamGameDetails = ({
  appData,
  tagVotes,
}: NormalizeSteamGameDetailsParams): NormalizedGameDetails => {
  const genresFromTags = deriveGenresFromSteamTags({ tagVotes });

  return {
    name: appData.name,
    headerImage: appData.header_image ?? null,
    descriptionHtml: appData.detailed_description ?? null,
    developers: appData.developers ?? [],
    publishers: appData.publishers ?? [],
    website: appData.website ?? null,
    releaseDate: appData.release_date?.date ?? null,
    releaseYear: extractReleaseYear(appData.release_date?.date) ?? null,
    genres: isNonEmptyArray(genresFromTags)
      ? genresFromTags
      : normalizeGenres(
          (appData.genres ?? []).map((genre) => genre.description),
        ),
    screenshots: (appData.screenshots ?? []).map(
      (screenshot) => screenshot.path_full,
    ),
    criticRating: null,
    criticRatingCount: null,
    externalIds: isDefined(appData.steam_appid)
      ? { steam: String(appData.steam_appid) }
      : {},
  };
};
