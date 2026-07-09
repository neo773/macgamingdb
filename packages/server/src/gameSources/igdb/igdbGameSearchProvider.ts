import {
  searchIGDBGames,
  getSteamAppIdFromIGDB,
  igdbImageUrl,
} from '../../api/igdb';
import type { GameSearchProvider } from '../GameSearchProvider';

export const igdbGameSearchProvider: GameSearchProvider = {
  source: 'igdb',

  async search(query, limit) {
    const results = await searchIGDBGames(query, limit * 2);

    // Games with a Steam appid are canonically Steam entries; surfacing them
    // here would duplicate the Steam provider's results.
    return results
      .filter((game) => getSteamAppIdFromIGDB(game) === null)
      .slice(0, limit)
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
  },
};
