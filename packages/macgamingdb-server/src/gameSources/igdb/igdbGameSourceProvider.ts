import {
  searchIGDBGames,
  getIGDBGameById,
  getSteamAppIdFromIGDB,
  igdbImageUrl,
} from '../../api/igdb';
import type { GameSourceProvider } from '../GameSourceProvider';
import { normalizeIgdbGameDetails } from './normalizeIgdbGameDetails';

export const igdbGameSourceProvider: GameSourceProvider = {
  source: 'igdb',

  async search(query, limit) {
    const results = await searchIGDBGames(query, limit * 2);

    // Games with a Steam appid are canonically Steam entries; surfacing them
    // here would duplicate the Steam provider's results.
    return results
      .filter((game) => getSteamAppIdFromIGDB(game) === null)
      .slice(0, limit)
      .map((game) => ({
        ref: `igdb-${game.id}`,
        source: 'igdb',
        name: game.name,
        slug: null,
        coverImage: game.cover
          ? igdbImageUrl(game.cover.image_id, 't_cover_big')
          : null,
        releaseYear: game.first_release_date
          ? new Date(game.first_release_date * 1000).getUTCFullYear()
          : null,
      }));
  },

  async fetchGame(externalId) {
    const igdbId = Number.parseInt(externalId, 10);
    if (Number.isNaN(igdbId)) {
      return null;
    }
    const data = await getIGDBGameById(igdbId);
    return data ? normalizeIgdbGameDetails(data) : null;
  },
};
