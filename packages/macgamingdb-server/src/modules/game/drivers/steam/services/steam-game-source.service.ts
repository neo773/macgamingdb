import { Injectable } from '@nestjs/common';
import type { GameSourceDriver } from '../../../interfaces/game-source-driver.interface';
import type { GameSearchResult } from '../../../types/game-search-result.type';
import type { NormalizedGameDetails } from '../../../types/normalized-game-details.type';
import { searchSteam } from '../utils/search-steam.util';
import { getGameBySteamId } from '../utils/get-game-by-steam-id.util';
import { normalizeSteamGameDetails } from '../utils/normalize-steam-game-details.util';

@Injectable()
export class SteamGameSourceService implements GameSourceDriver {
  async search({
    query,
    limit,
  }: {
    query: string;
    limit: number;
  }): Promise<GameSearchResult[]> {
    const results = await searchSteam(query);

    return results.slice(0, limit).map(
      (result): GameSearchResult => ({
        ref: result.objectID,
        source: 'steam',
        name: result.name,
        slug: null,
        coverImage: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${result.objectID}/header.jpg`,
        releaseYear: result.releaseYear ?? null,
      }),
    );
  }

  async fetchGame({
    externalId,
  }: {
    externalId: string;
  }): Promise<NormalizedGameDetails | null> {
    const data = await getGameBySteamId(externalId);
    return data ? normalizeSteamGameDetails(data) : null;
  }
}
