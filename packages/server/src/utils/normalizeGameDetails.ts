import { type SteamAppData } from '../api/steam';
import {
  type IGDBGameData,
  igdbImageUrl,
  getSteamAppIdFromIGDB,
} from '../api/igdb';
import { extractReleaseYear } from './extractReleaseYear';

const IGDB_WEBSITE_CATEGORY_OFFICIAL = 1;

export interface NormalizedGameDetails {
  source: 'steam' | 'igdb';
  name: string;
  headerImage: string | null;
  descriptionHtml: string | null;
  developers: string[];
  publishers: string[];
  website: string | null;
  steamAppId: string | null;
  releaseDate: string | null;
  releaseYear: number | null;
  genres: string[];
  screenshots: string[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

function normalizeSteamDetails(data: SteamAppData): NormalizedGameDetails {
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

function normalizeIgdbDetails(data: IGDBGameData): NormalizedGameDetails {
  const developers = (data.involved_companies ?? [])
    .filter((company) => company.developer)
    .map((company) => company.company.name);

  const publishers = (data.involved_companies ?? [])
    .filter((company) => company.publisher)
    .map((company) => company.company.name);

  const officialWebsite = (data.websites ?? []).find(
    (website) => website.category === IGDB_WEBSITE_CATEGORY_OFFICIAL,
  );

  return {
    source: 'igdb',
    name: data.name,
    headerImage: data.cover
      ? igdbImageUrl(data.cover.image_id, 't_720p')
      : null,
    descriptionHtml: igdbSummaryToHtml(data.summary),
    developers,
    publishers,
    website: officialWebsite?.url ?? null,
    steamAppId: getSteamAppIdFromIGDB(data),
    releaseDate: formatIgdbReleaseDate(data.first_release_date),
    releaseYear:
      data.first_release_date !== undefined
        ? new Date(data.first_release_date * 1000).getUTCFullYear()
        : null,
    genres: (data.genres ?? []).map((genre) => genre.name),
    screenshots: (data.screenshots ?? []).map((screenshot) =>
      igdbImageUrl(screenshot.image_id, 't_screenshot_big'),
    ),
  };
}

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

  if (source === 'igdb') {
    return normalizeIgdbDetails(parsed as IGDBGameData);
  }

  return normalizeSteamDetails(parsed as SteamAppData);
}
