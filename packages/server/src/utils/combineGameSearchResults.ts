import Fuse from 'fuse.js';
import type { z } from 'zod';
import type { SteamGameSearchObject } from '../api/steam';
import {
  type IGDBGameData,
  getSteamAppIdFromIGDB,
  igdbImageUrl,
} from '../api/igdb';
import type { GameSearchResultSchema } from '../schema/openapi';

type GameSearchResult = z.infer<typeof GameSearchResultSchema>;

function dedupeKey(item: GameSearchResult): string {
  return `${item.name.trim().toLowerCase()}|${item.releaseYear ?? ''}`;
}

function normalizedName(item: GameSearchResult): string {
  return item.name.trim().toLowerCase();
}

export function combineGameSearchResults(options: {
  query: string;
  steamResults: SteamGameSearchObject[];
  igdbResults: IGDBGameData[];
  slugBySteamAppId: Map<string, string | null>;
}): GameSearchResult[] {
  const { query, steamResults, igdbResults, slugBySteamAppId } = options;

  const steamItems: GameSearchResult[] = steamResults.map((result) => ({
    objectID: result.objectID,
    name: result.name,
    url: result.url,
    tagIds: result.tagIds,
    source: 'steam',
    slug: slugBySteamAppId.get(result.objectID) ?? null,
    releaseYear: result.releaseYear,
  }));

  const igdbItems: GameSearchResult[] = igdbResults
    .filter((game) => getSteamAppIdFromIGDB(game) === null)
    .slice(0, 10)
    .map((game) => ({
      objectID: `igdb-${game.id}`,
      name: game.name,
      url: '',
      source: 'igdb',
      igdbId: game.id,
      coverImage: game.cover
        ? igdbImageUrl(game.cover.image_id, 't_cover_big')
        : undefined,
      releaseYear: game.first_release_date
        ? new Date(game.first_release_date * 1000).getUTCFullYear()
        : undefined,
    }));

  const itemsByNameAndYear = new Map<string, GameSearchResult>();
  for (const item of [...steamItems, ...igdbItems]) {
    const key = dedupeKey(item);
    const existing = itemsByNameAndYear.get(key);
    if (!existing) {
      itemsByNameAndYear.set(key, item);
    } else if (existing.source === 'igdb' && item.source === 'steam') {
      itemsByNameAndYear.set(key, item);
    } else if (
      existing.source === 'igdb' &&
      item.source === 'igdb' &&
      (item.igdbId ?? Infinity) < (existing.igdbId ?? Infinity)
    ) {
      itemsByNameAndYear.set(key, item);
    }
  }

  const dedupedItems = [...itemsByNameAndYear.values()];
  const namesWithYear = new Set(
    dedupedItems
      .filter((item) => item.releaseYear !== undefined)
      .map(normalizedName),
  );
  const searchableItems = dedupedItems.filter(
    (item) =>
      item.releaseYear !== undefined || !namesWithYear.has(normalizedName(item)),
  );

  const fuse = new Fuse(searchableItems, {
    keys: ['name'],
    threshold: 0.4,
    ignoreLocation: true,
  });

  return fuse.search(query).map((match) => match.item);
}
