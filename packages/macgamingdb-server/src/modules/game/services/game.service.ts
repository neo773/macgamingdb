import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  max,
  type SQL,
} from 'drizzle-orm';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import {
  games,
  gameReviews,
  gameSourceLinks,
  type ChipsetVariant,
  type PerformanceRating,
  type PlayMethod,
} from '../../../database/schema';
import { CHIPSET_VARIANTS, type Chipset } from '../../../schema';
import { FileStorageService } from '../../../engine/core-modules/file-storage/services/file-storage.service';
import { extractKeyFromUrl } from '../../../engine/core-modules/file-storage/utils/extract-key-from-url.util';
import { parseGameRef } from '../utils/parse-game-ref.util';
import { GgDealsApiClientService } from '../../pricing/drivers/ggdeals/services/ggdeals-api-client.service';
import { GameSearchService } from './game-search.service';
import { GameMaterializationService } from './game-materialization.service';
import { calculateAveragePerformance } from '../../review/utils/calculate-average-performance.util';
import { calculateTranslationLayerStats } from '../../review/utils/calculate-translation-layer-stats.util';
import { GameException } from '../exceptions/game.exception';

type RatingCounts = Record<PerformanceRating | 'ALL', number>;

type ReviewFilter = {
  chipset?: Chipset;
  chipsetVariant?: ChipsetVariant;
  playMethod?: PlayMethod;
};

const createEmptyCounts = (): RatingCounts => ({
  ALL: 0,
  EXCELLENT: 0,
  VERY_GOOD: 0,
  GOOD: 0,
  PLAYABLE: 0,
  BARELY_PLAYABLE: 0,
  UNPLAYABLE: 0,
});

@Injectable()
export class GameService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB,
    private readonly gameSearchService: GameSearchService,
    private readonly gameMaterializationService: GameMaterializationService,
    private readonly ggDealsApiClientService: GgDealsApiClientService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  assertValidChipsetVariant(input: {
    chipset?: Chipset;
    chipsetVariant?: ChipsetVariant;
  }): void {
    if (
      input.chipset &&
      input.chipsetVariant &&
      !CHIPSET_VARIANTS[input.chipset].includes(input.chipsetVariant)
    ) {
      throw new GameException(
        `${input.chipset} has no ${input.chipsetVariant} variant`,
        'CHIPSET_VARIANT_INVALID',
      );
    }
  }

  async search(query: string) {
    return this.gameSearchService.search({ query });
  }

  async getCoverArt(gameId: string) {
    const game = await this.gameMaterializationService.resolveGame({
      identifier: gameId,
    });

    if (!game?.headerImage) {
      throw new GameException(
        'Cover art not found for this game',
        'COVER_ART_NOT_FOUND',
      );
    }

    return { headerImage: game.headerImage };
  }

  private async getUnfilteredCounts(): Promise<RatingCounts> {
    const counts = await this.db
      .select({
        aggregatedPerformance: games.aggregatedPerformance,
        count: count(),
      })
      .from(games)
      .where(isNotNull(games.aggregatedPerformance))
      .groupBy(games.aggregatedPerformance);

    const result = createEmptyCounts();
    for (const row of counts) {
      if (row.aggregatedPerformance) {
        result[row.aggregatedPerformance] = row.count;
        result.ALL += row.count;
      }
    }
    return result;
  }

  private async getFilteredCounts(
    reviewFilter: ReviewFilter,
  ): Promise<RatingCounts> {
    const conditions: SQL[] = [isNull(gameReviews.hiddenAt)];
    if (reviewFilter.chipset)
      conditions.push(eq(gameReviews.chipset, reviewFilter.chipset));
    if (reviewFilter.chipsetVariant)
      conditions.push(eq(gameReviews.chipsetVariant, reviewFilter.chipsetVariant));
    if (reviewFilter.playMethod)
      conditions.push(eq(gameReviews.playMethod, reviewFilter.playMethod));

    const pairs = await this.db
      .select({
        gameId: gameReviews.gameId,
        performance: gameReviews.performance,
      })
      .from(gameReviews)
      .where(and(...conditions));

    const result = createEmptyCounts();
    const seen = new Map<PerformanceRating, Set<string>>();

    for (const { gameId, performance } of pairs) {
      if (!seen.has(performance)) {
        seen.set(performance, new Set());
      }
      seen.get(performance)!.add(gameId);
    }

    for (const [rating, gameIds] of seen) {
      result[rating] = gameIds.size;
      result.ALL += gameIds.size;
    }
    return result;
  }

  async getFilterCounts(input: {
    chipset?: Chipset;
    chipsetVariant?: ChipsetVariant;
    playMethod: 'ALL' | PlayMethod;
  }): Promise<RatingCounts> {
    this.assertValidChipsetVariant(input);
    const { chipset, chipsetVariant, playMethod } = input;

    const reviewFilter: ReviewFilter = {
      ...(chipset && { chipset }),
      ...(chipset && chipsetVariant && { chipsetVariant }),
      ...(playMethod !== 'ALL' && { playMethod }),
    };

    const hasFilters = isNonEmptyArray(Object.keys(reviewFilter));

    if (hasFilters) {
      return this.getFilteredCounts(reviewFilter);
    }

    return this.getUnfilteredCounts();
  }

  async getGames(input: {
    limit: number;
    cursor: number;
    performance: 'ALL' | PerformanceRating;
    chipset?: Chipset;
    chipsetVariant?: ChipsetVariant;
    playMethod: 'ALL' | PlayMethod;
  }) {
    this.assertValidChipsetVariant(input);
    try {
      const {
        limit,
        cursor: offset,
        performance,
        chipset,
        chipsetVariant,
        playMethod,
      } = input;

      const hasChipsetOrPlayMethodFilter = chipset || playMethod !== 'ALL';

      if (hasChipsetOrPlayMethodFilter) {
        const reviewConditions: SQL[] = [isNull(gameReviews.hiddenAt)];
        if (performance !== 'ALL')
          reviewConditions.push(eq(gameReviews.performance, performance));
        if (chipset) reviewConditions.push(eq(gameReviews.chipset, chipset));
        if (chipset && chipsetVariant)
          reviewConditions.push(eq(gameReviews.chipsetVariant, chipsetVariant));
        if (playMethod !== 'ALL')
          reviewConditions.push(eq(gameReviews.playMethod, playMethod));

        const matchingGameIds = this.db
          .selectDistinct({ gameId: gameReviews.gameId })
          .from(gameReviews)
          .where(and(...reviewConditions));

        const gamesForIds = await this.db
          .select({ id: games.id })
          .from(games)
          .where(inArray(games.id, matchingGameIds))
          .orderBy(desc(games.reviewCount))
          .offset(offset)
          .limit(limit * 3);

        const gameIds = gamesForIds.map((game) => game.id);

        if (!isNonEmptyArray(gameIds)) {
          return {
            games: [],
            hasNextPage: false,
            nextOffset: undefined,
          };
        }

        const matchedGames = await this.db
          .select()
          .from(games)
          .where(
            and(
              inArray(games.id, gameIds),
              isNotNull(games.aggregatedPerformance),
            ),
          )
          .orderBy(desc(games.reviewCount))
          .limit(limit + 1);

        const gamesWithPerformance = matchedGames
          .filter(
            (
              game,
            ): game is typeof game & {
              aggregatedPerformance: NonNullable<
                typeof game.aggregatedPerformance
              >;
            } => isDefined(game.aggregatedPerformance),
          )
          .map((game) => ({
            id: game.id,
            slug: game.slug,
            name: game.name,
            headerImage: game.headerImage,
            releaseYear: game.releaseYear,
            performanceRating: game.aggregatedPerformance,
          }));

        const hasNextPage = gamesWithPerformance.length > limit;
        const gamesToReturn = hasNextPage
          ? gamesWithPerformance.slice(0, limit)
          : gamesWithPerformance;

        return {
          games: gamesToReturn,
          hasNextPage,
          nextOffset: hasNextPage ? offset + limit : undefined,
        };
      }

      const conditions: SQL[] = [];
      if (performance !== 'ALL') {
        conditions.push(eq(games.aggregatedPerformance, performance));
      }

      const matchedGames = await this.db
        .select()
        .from(games)
        .where(isNonEmptyArray(conditions) ? and(...conditions) : undefined)
        .orderBy(desc(games.reviewCount))
        .offset(offset)
        .limit(limit + 1);

      const gamesWithPerformance = matchedGames
        .filter(
          (
            game,
          ): game is typeof game & {
            aggregatedPerformance: NonNullable<
              typeof game.aggregatedPerformance
            >;
          } => isDefined(game.aggregatedPerformance),
        )
        .map((game) => ({
          id: game.id,
          slug: game.slug,
          name: game.name,
          headerImage: game.headerImage,
          releaseYear: game.releaseYear,
          performanceRating: game.aggregatedPerformance,
        }));

      const hasNextPage = gamesWithPerformance.length > limit;
      const gamesToReturn = hasNextPage
        ? gamesWithPerformance.slice(0, limit)
        : gamesWithPerformance;

      return {
        games: gamesToReturn,
        hasNextPage,
        nextOffset: hasNextPage ? offset + limit : undefined,
      };
    } catch (error) {
      console.error('Error fetching games:', error);
      throw new GameException('Failed to fetch games', 'GAME_FETCH_FAILED');
    }
  }

  async getById(id: string) {
    try {
      let game = await this.gameMaterializationService.resolveGame({
        identifier: id,
      });

      if (!game?.name) {
        const ref = parseGameRef(id);
        if (ref) {
          game = await this.gameMaterializationService.materializeGame({
            source: ref.source,
            externalId: ref.externalId,
          });
        }
      }

      if (!game || !isDefined(game.name)) {
        throw new GameException('Game not found', 'GAME_NOT_FOUND');
      }

      const sourceLinks = await this.db.query.gameSourceLinks.findMany({
        where: eq(gameSourceLinks.gameId, game.id),
        columns: { source: true, externalId: true },
      });

      const reviews = await this.db.query.gameReviews.findMany({
        where: and(eq(gameReviews.gameId, game.id), isNull(gameReviews.hiddenAt)),
        with: {
          macConfig: true,
        },
      });

      const reviewStats =
        isNonEmptyArray(reviews)
          ? {
              totalReviews: reviews.length,
              methods: {
                native: reviews.filter((review) => review.playMethod === 'NATIVE')
                  .length,
                crossover: reviews.filter(
                  (review) => review.playMethod === 'CROSSOVER',
                ).length,
                parallels: reviews.filter(
                  (review) => review.playMethod === 'PARALLELS',
                ).length,
                other: reviews.filter((review) => review.playMethod === 'OTHER')
                  .length,
              },
              averagePerformance: calculateAveragePerformance(reviews),
              translationLayers: calculateTranslationLayerStats(reviews),
            }
          : null;

      return {
        game: { ...game, name: game.name, sourceLinks },
        reviews,
        stats: reviewStats,
      };
    } catch (error) {
      if (error instanceof GameException) {
        throw error;
      }
      console.error(`Error fetching game details for ID ${id}:`, error);
      throw new GameException(
        'Failed to fetch game details',
        'GAME_FETCH_FAILED',
      );
    }
  }

  async getScreenshotSignedUrls(screenshots: string[]) {
    try {
      const signedUrls = await Promise.all(
        screenshots.map(async (url) => {
          const key = extractKeyFromUrl(url);
          if (!key) {
            console.warn(`Could not extract key from URL: ${url}`);
            return { original: url, signed: url };
          }

          try {
            const signedUrl = await this.fileStorageService.getViewSignedUrl({
              key,
              expiresIn: 3600,
            });
            return { original: url, signed: signedUrl };
          } catch (error) {
            console.warn(
              `Could not generate signed URL for key: ${key}`,
              error,
            );
            return { original: url, signed: url };
          }
        }),
      );

      return signedUrls;
    } catch (error) {
      console.error('Error generating signed URLs:', error);
      throw new GameException(
        'Failed to generate signed URLs for screenshots',
        'GAME_FETCH_FAILED',
      );
    }
  }

  async getPrices({ gameId, region }: { gameId: string; region: string }) {
    try {
      const game = await this.gameMaterializationService.resolveGame({
        identifier: gameId,
      });
      if (!game) {
        return null;
      }

      const steamLink = await this.db.query.gameSourceLinks.findFirst({
        where: and(
          eq(gameSourceLinks.gameId, game.id),
          eq(gameSourceLinks.source, 'steam'),
        ),
      });
      if (!steamLink) {
        return null;
      }

      const data = await this.ggDealsApiClientService.getGamePrices({
        steamAppId: steamLink.externalId,
        country: region,
      });
      return data ?? null;
    } catch {
      return null;
    }
  }

  async getSitemapEntries() {
    const rows = await this.db
      .select({
        id: games.id,
        slug: games.slug,
        lastModified: max(gameReviews.updatedAt),
      })
      .from(games)
      .innerJoin(gameReviews, eq(gameReviews.gameId, games.id))
      .where(isNull(gameReviews.hiddenAt))
      .groupBy(games.id);

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      lastModified: row.lastModified ?? new Date(0).toISOString(),
    }));
  }
}
