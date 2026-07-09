import { searchSteam } from '../../api/steam';
import type { GameSearchProvider } from '../GameSearchProvider';

export const steamGameSearchProvider: GameSearchProvider = {
  source: 'steam',

  async search(query, limit) {
    const results = await searchSteam(query);

    return results.slice(0, limit).map((result) => ({
      objectID: result.objectID,
      name: result.name,
      url: result.url,
      tagIds: result.tagIds,
      source: 'steam',
      releaseYear: result.releaseYear,
    }));
  },
};
