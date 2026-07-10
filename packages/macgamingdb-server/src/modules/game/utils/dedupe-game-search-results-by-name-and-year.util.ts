import { isDefined } from 'macgamingdb-shared/utils/isDefined';

import type { GameSearchResult } from '../types/game-search-result.type';

const normalizedName = (item: GameSearchResult): string =>
  item.name.trim().toLowerCase();

export const dedupeGameSearchResultsByNameAndYear = (
  items: GameSearchResult[],
): GameSearchResult[] => {
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
    deduped.filter((item) => isDefined(item.releaseYear)).map(normalizedName),
  );

  // A yearless entry alongside a dated same-name entry is a duplicate record
  // of the same game, not a different game.
  return deduped.filter(
    (item) =>
      isDefined(item.releaseYear) || !namesWithYear.has(normalizedName(item)),
  );
};
