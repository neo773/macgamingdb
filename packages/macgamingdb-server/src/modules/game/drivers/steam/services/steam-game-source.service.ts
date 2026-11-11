import { Injectable } from '@nestjs/common';
import { createLogger } from '../../../../../engine/core-modules/logger/create-logger.util';
import type { GameSourceDriver } from '../../../interfaces/game-source-driver.interface';
import type { GameSearchResult } from '../../../types/game-search-result.type';
import type { NormalizedGameDetails } from '../../../types/normalized-game-details.type';
import { searchSteam } from '../utils/search-steam.util';
import { getGameBySteamId } from '../utils/get-game-by-steam-id.util';
import { normalizeSteamGameDetails } from '../utils/normalize-steam-game-details.util';
import { SteamStoreTagsService } from './steam-store-tags.service';

const logger = createLogger('SteamGameSource');

@Injectable()
export class SteamGameSourceService implements GameSourceDriver {
  constructor(private readonly steamStoreTagsService: SteamStoreTagsService) {}

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
    const appData = await getGameBySteamId(externalId);
    if (!appData) {
      return null;
    }

    const tagVotes = await this.fetchTagVotes({ steamAppId: externalId });

    return normalizeSteamGameDetails({ appData, tagVotes });
  }

  private async fetchTagVotes({
    steamAppId,
  }: {
    steamAppId: string;
  }): Promise<Record<string, number>> {
    try {
      const tagVotesByAppId =
        await this.steamStoreTagsService.fetchTagVotesByAppIds({
          steamAppIds: [steamAppId],
        });
      return tagVotesByAppId.get(steamAppId) ?? {};
    } catch (error) {
      logger.warn(
        `Steam tags unavailable for ${steamAppId}, falling back to store genres: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {};
    }
  }
}
