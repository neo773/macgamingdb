import {
  type IGDBGameData,
  igdbImageUrl,
  getSteamAppIdFromIGDB,
} from '../../api/igdb';
import type { NormalizedGameDetails } from '../NormalizedGameDetails';

const IGDB_WEBSITE_CATEGORY_OFFICIAL = 1;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// IGDB summaries are plain text with double-newline paragraph breaks.
function igdbSummaryToHtml(summary: string | undefined): string | null {
  if (summary === undefined || summary.trim() === '') {
    return null;
  }

  return summary
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== '')
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');
}

function formatIgdbReleaseDate(
  firstReleaseDate: number | undefined,
): string | null {
  if (firstReleaseDate === undefined) {
    return null;
  }

  return new Date(firstReleaseDate * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function normalizeIgdbGameDetails(
  data: IGDBGameData,
): NormalizedGameDetails {
  const steamAppId = getSteamAppIdFromIGDB(data);

  return {
    name: data.name,
    headerImage: data.cover
      ? igdbImageUrl(data.cover.image_id, 't_720p')
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
    releaseYear:
      data.first_release_date !== undefined
        ? new Date(data.first_release_date * 1000).getUTCFullYear()
        : null,
    genres: (data.genres ?? []).map((genre) => genre.name),
    screenshots: (data.screenshots ?? []).map((screenshot) =>
      igdbImageUrl(screenshot.image_id, 't_screenshot_big'),
    ),
    externalIds: {
      igdb: String(data.id),
      ...(steamAppId !== null && { steam: steamAppId }),
    },
  };
}
