import { searchSteam, getGameBySteamId } from '../../api/steam';
import type { GameSourceProvider } from '../GameSourceProvider';
import { normalizeSteamGameDetails } from './normalizeSteamGameDetails';

export const steamGameSourceProvider: GameSourceProvider = {
  source: 'steam',

  async search(query, limit) {
    const results = await searchSteam(query);

    return results.slice(0, limit).map((result) => ({
      ref: result.objectID,
      source: 'steam',
      name: result.name,
      slug: null,
      coverImage: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${result.objectID}/header.jpg`,
      releaseYear: result.releaseYear ?? null,
    }));
  },

  async fetchGame(externalId) {
    const data = await getGameBySteamId(externalId);
    return data ? normalizeSteamGameDetails(data) : null;
  },
};
