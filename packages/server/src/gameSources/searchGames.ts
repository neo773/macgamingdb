import Fuse from 'fuse.js';
import { inArray } from 'drizzle-orm';
import type { DrizzleDB } from '../database/drizzle';
import { games } from '../drizzle/schema';
import type { GameSearchResult } from './GameSearchResult';
import { gameSearchProviders } from './gameSearchProviders';

const RESULTS_PER_PROVIDER = 10;

function normalizedName(item: GameSearchResult): string {
  return item.name.trim().toLowerCase();
}

async function attachSlugs(
  db: DrizzleDB,
  items: GameSearchResult[],
): Promise<GameSearchResult[]> {
  if (items.length === 0) {
    return items;
  }

  const cachedGames = await db
    .select({ id: games.id, slug: games.slug })
    .from(games)
    .where(
      inArray(
        games.id,
        items.map((item) => item.objectID),
      ),
    );
  const slugByGameId = new Map(cachedGames.map((game) => [game.id, game.slug]));

  return items.map((item) => ({
    ...item,
    slug: slugByGameId.get(item.objectID) ?? null,
  }));
}

function dedupeByNameAndYear(items: GameSearchResult[]): GameSearchResult[] {
  const itemsByNameAndYear = new Map<string, GameSearchResult>();

  for (const item of items) {
    const key = `${normalizedName(item)}|${item.releaseYear ?? ''}`;
    const existing = itemsByNameAndYear.get(key);

    const itemWins =
      !existing ||
      (existing.source === 'igdb' && item.source === 'steam') ||
      (existing.source === 'igdb' &&
        item.source === 'igdb' &&
        (item.igdbId ?? Infinity) < (existing.igdbId ?? Infinity));

    if (itemWins) {
      itemsByNameAndYear.set(key, item);
    }
  }

  const deduped = [...itemsByNameAndYear.values()];
  const namesWithYear = new Set(
    deduped
      .filter((item) => item.releaseYear !== undefined)
      .map(normalizedName),
  );

  // A yearless entry alongside a dated same-name entry is a duplicate record
  // of the same game, not a different game.
  return deduped.filter(
    (item) =>
      item.releaseYear !== undefined || !namesWithYear.has(normalizedName(item)),
  );
}

function rankByRelevance(
  items: GameSearchResult[],
  query: string,
): GameSearchResult[] {
  const fuse = new Fuse(items, {
    keys: ['name'],
    threshold: 0.4,
    ignoreLocation: true,
  });

  return fuse.search(query).map((match) => match.item);
}

export async function searchGames(
  db: DrizzleDB,
  query: string,
): Promise<GameSearchResult[]> {
  const settledSearches = await Promise.allSettled(
    gameSearchProviders.map((provider) =>
      provider.search(query, RESULTS_PER_PROVIDER),
    ),
  );

  const items = settledSearches.flatMap((settled, index) => {
    if (settled.status === 'rejected') {
      console.error(
        `${gameSearchProviders[index].source} search error:`,
        settled.reason,
      );
      return [];
    }
    return settled.value;
  });

  const itemsWithSlugs = await attachSlugs(db, items);
  return rankByRelevance(dedupeByNameAndYear(itemsWithSlugs), query);
}
