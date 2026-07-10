import Fuse from 'fuse.js';
import type { GameSearchResult } from '../types/game-search-result.type';

export const rankGameSearchResultsByRelevance = ({
  items,
  query,
}: {
  items: GameSearchResult[];
  query: string;
}): GameSearchResult[] => {
  const fuse = new Fuse(items, {
    keys: ['name'],
    threshold: 0.4,
    ignoreLocation: true,
  });

  return fuse.search(query).map((match) => match.item);
};
