import Fuse from 'fuse.js';
import { inArray } from 'drizzle-orm';
import type { DrizzleDB } from '../database/drizzle';
import { gameSourceLinks } from '../drizzle/schema';
import type { GameSearchResult } from './GameSearchResult';
import { gameSourceProviders } from './gameSourceProviders';
import { parseGameRef } from './parseGameRef';

const RESULTS_PER_PROVIDER = 10;

function normalizedName(item: GameSearchResult): string {
  return item.name.trim().toLowerCase();
}

async function attachKnownGames(
  db: DrizzleDB,
  items: GameSearchResult[],
): Promise<GameSearchResult[]> {
  if (items.length === 0) {
    return items;
  }

  const links = await db.query.gameSourceLinks.findMany({
    where: inArray(
      gameSourceLinks.externalId,
      items.map((item) => parseGameRef(item.ref)?.externalId ?? item.ref),
    ),
    with: { game: { columns: { slug: true, headerImage: true } } },
  });
  const gameByLink = new Map(
    links.map((link) => [`${link.source}|${link.externalId}`, link.game]),
  );

  return items.map((item) => {
    const ref = parseGameRef(item.ref);
    const game = ref
      ? gameByLink.get(`${ref.source}|${ref.externalId}`)
      : undefined;
    if (!game) {
      return item;
    }
    return {
      ...item,
      slug: game.slug,
      coverImage: game.headerImage ?? item.coverImage,
    };
  });
}

function dedupeByNameAndYear(items: GameSearchResult[]): GameSearchResult[] {
  const itemsByNameAndYear = new Map<string, GameSearchResult>();

  for (const item of items) {
    const key = `${normalizedName(item)}|${item.releaseYear ?? ''}`;
    const existing = itemsByNameAndYear.get(key);

    const itemWins =
      !existing || (existing.source !== 'steam' && item.source === 'steam');

    if (itemWins) {
      itemsByNameAndYear.set(key, item);
    }
  }

  const deduped = [...itemsByNameAndYear.values()];
  const namesWithYear = new Set(
    deduped.filter((item) => item.releaseYear !== null).map(normalizedName),
  );

  // A yearless entry alongside a dated same-name entry is a duplicate record
  // of the same game, not a different game.
  return deduped.filter(
    (item) =>
      item.releaseYear !== null || !namesWithYear.has(normalizedName(item)),
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
  const providers = Object.values(gameSourceProviders);
  const settledSearches = await Promise.allSettled(
    providers.map((provider) => provider.search(query, RESULTS_PER_PROVIDER)),
  );

  const items = settledSearches.flatMap((settled, index) => {
    if (settled.status === 'rejected') {
      console.error(`${providers[index].source} search error:`, settled.reason);
      return [];
    }
    return settled.value;
  });

  const itemsWithKnownGames = await attachKnownGames(db, items);
  return rankByRelevance(dedupeByNameAndYear(itemsWithKnownGames), query);
}
