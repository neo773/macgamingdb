import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import { isNonEmptyArray } from '@sniptt/guards';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { gameSourceLinks } from '../../../database/schema';
import { GAME_SOURCES } from '../constants/game-sources.constant';
import type { GameSource } from '../types/game-source.type';
import type { GameSearchResult } from '../types/game-search-result.type';
import type { GameSourceDriver } from '../interfaces/game-source-driver.interface';
import { SteamGameSourceService } from '../drivers/steam/services/steam-game-source.service';
import { IgdbGameSourceService } from '../drivers/igdb/services/igdb-game-source.service';
import { dedupeGameSearchResultsByNameAndYear } from '../utils/dedupe-game-search-results-by-name-and-year.util';
import { rankGameSearchResultsByRelevance } from '../utils/rank-game-search-results-by-relevance.util';
import { parseGameRef } from '../utils/parse-game-ref.util';
import { GameException } from '../exceptions/game.exception';

const RESULTS_PER_SOURCE = 10;

@Injectable()
export class GameSearchService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB,
    private readonly steamGameSourceService: SteamGameSourceService,
    private readonly igdbGameSourceService: IgdbGameSourceService,
  ) {}

  async search({ query }: { query: string }): Promise<GameSearchResult[]> {
    const settledSearches = await Promise.allSettled(
      GAME_SOURCES.map((source) =>
        this.gameSourceDriverFor(source).search({
          query,
          limit: RESULTS_PER_SOURCE,
        }),
      ),
    );

    const items = settledSearches.flatMap((settled, index) => {
      if (settled.status === 'rejected') {
        console.error(`${GAME_SOURCES[index]} search error:`, settled.reason);
        return [];
      }
      return settled.value;
    });

    const itemsWithKnownGames = await this.attachKnownGames(items);
    return rankGameSearchResultsByRelevance({
      items: dedupeGameSearchResultsByNameAndYear(itemsWithKnownGames),
      query,
    });
  }

  private gameSourceDriverFor(source: GameSource): GameSourceDriver {
    switch (source) {
      case 'steam':
        return this.steamGameSourceService;
      case 'igdb':
        return this.igdbGameSourceService;
      default:
        throw new GameException(
          `Unknown game source: ${source}`,
          'GAME_SOURCE_UNKNOWN',
        );
    }
  }

  private async attachKnownGames(
    items: GameSearchResult[],
  ): Promise<GameSearchResult[]> {
    if (!isNonEmptyArray(items)) {
      return items;
    }

    const links = await this.db.query.gameSourceLinks.findMany({
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
}
