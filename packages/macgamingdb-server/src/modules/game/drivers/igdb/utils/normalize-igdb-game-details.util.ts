import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from 'macgamingdb-shared/utils/isDefined';

import { IGDB_WEBSITE_CATEGORY_OFFICIAL } from '../constants/igdb-website-category-official.constant';
import type { NormalizedGameDetails } from '../../../types/normalized-game-details.type';
import type { IgdbGameData } from '../types/igdb-game-data.type';
import { igdbImageUrl } from './igdb-image-url.util';
import { getSteamAppIdFromIgdb } from './get-steam-app-id-from-igdb.util';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// IGDB summaries are plain text with double-newline paragraph breaks.
const igdbSummaryToHtml = (summary: string | undefined): string | null => {
  if (!isDefined(summary) || !isNonEmptyString(summary.trim())) {
    return null;
  }

  return summary
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => isNonEmptyString(paragraph))
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');
};

const formatIgdbReleaseDate = (
  firstReleaseDate: number | undefined,
): string | null => {
  if (!isDefined(firstReleaseDate)) {
    return null;
  }

  return new Date(firstReleaseDate * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

export const normalizeIgdbGameDetails = (
  data: IgdbGameData,
): NormalizedGameDetails => {
  const steamAppId = getSteamAppIdFromIgdb(data);

  return {
    name: data.name,
    headerImage: data.cover
      ? igdbImageUrl({ imageId: data.cover.image_id, size: 't_720p' })
      : null,
    descriptionHtml: igdbSummaryToHtml(data.summary),
    developers: (data.involved_companies ?? [])
      .filter((company) => company.developer)
      .map((company) => company.company.name),
    publishers: (data.involved_companies ?? [])
      .filter((company) => company.publisher)
      .map((company) => company.company.name),
    website:
      (data.websites ?? []).find(
        (website) => website.category === IGDB_WEBSITE_CATEGORY_OFFICIAL,
      )?.url ?? null,
    releaseDate: formatIgdbReleaseDate(data.first_release_date),
    releaseYear: isDefined(data.first_release_date)
      ? new Date(data.first_release_date * 1000).getUTCFullYear()
      : null,
    genres: (data.genres ?? []).map((genre) => genre.name),
    screenshots: (data.screenshots ?? []).map((screenshot) =>
      igdbImageUrl({ imageId: screenshot.image_id, size: 't_screenshot_big' }),
    ),
    externalIds: {
      igdb: String(data.id),
      ...(isDefined(steamAppId) && { steam: steamAppId }),
    },
  };
};
