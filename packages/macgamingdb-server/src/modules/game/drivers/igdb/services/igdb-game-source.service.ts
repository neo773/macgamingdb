import { Injectable } from '@nestjs/common';
import type { GameSourceDriver } from '../../../interfaces/game-source-driver.interface';
import type { GameSearchResult } from '../../../types/game-search-result.type';
import type { NormalizedGameDetails } from '../../../types/normalized-game-details.type';
import { igdbImageUrl } from '../utils/igdb-image-url.util';
import { getSteamAppIdFromIgdb } from '../utils/get-steam-app-id-from-igdb.util';
import { normalizeIgdbGameDetails } from '../utils/normalize-igdb-game-details.util';
import { IgdbApiClientService } from './igdb-api-client.service';

@Injectable()
export class IgdbGameSourceService implements GameSourceDriver {
  constructor(private readonly igdbApiClientService: IgdbApiClientService) {}

  async search({
    query,
    limit,
  }: {
    query: string;
    limit: number;
  }): Promise<GameSearchResult[]> {
    const results = await this.igdbApiClientService.searchGames({
      query,
      limit: limit * 2,
    });

    // Games with a Steam appid are canonically Steam entries; surfacing them
    // here would duplicate the Steam driver's results.
    return results
      .filter((game) => getSteamAppIdFromIgdb(game) === null)
      .slice(0, limit)
      .map(
        (game): GameSearchResult => ({
          ref: `igdb-${game.id}`,
          source: 'igdb',
          name: game.name,
          slug: null,
          coverImage: game.cover
            ? igdbImageUrl({ imageId: game.cover.image_id })
            : null,
          releaseYear: game.first_release_date
            ? new Date(game.first_release_date * 1000).getUTCFullYear()
            : null,
        }),
      );
  }

  async fetchGame({
    externalId,
  }: {
    externalId: string;
  }): Promise<NormalizedGameDetails | null> {
    const igdbId = Number.parseInt(externalId, 10);
    if (Number.isNaN(igdbId)) {
      return null;
    }
    const data = await this.igdbApiClientService.getGameById({ igdbId });
    return data ? normalizeIgdbGameDetails(data) : null;
  }
}
