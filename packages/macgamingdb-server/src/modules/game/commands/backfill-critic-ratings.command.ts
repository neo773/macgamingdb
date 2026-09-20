import { Inject } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { eq } from 'drizzle-orm';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { isNonEmptyArray } from '@sniptt/guards';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { games, gameSourceLinks } from '../../../database/schema';
import { createLogger } from '../../../engine/core-modules/logger/create-logger.util';
import { IgdbApiClientService } from '../drivers/igdb/services/igdb-api-client.service';
import { extractIgdbCriticRating } from '../drivers/igdb/utils/extract-igdb-critic-rating.util';

const logger = createLogger('BackfillCriticRatings');

const IGDB_BATCH_SIZE = 200;
const SAMPLE_SIZE = 10;

type BackfillCriticRatingsOptions = {
  dryRun?: boolean;
};

@Command({
  name: 'backfill-critic-ratings',
  description:
    'Fetch IGDB aggregated critic ratings for every Steam-linked game and persist them',
})
export class BackfillCriticRatingsCommand extends CommandRunner {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB,
    private readonly igdbApiClient: IgdbApiClientService,
  ) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: BackfillCriticRatingsOptions,
  ): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    const linkedGames = await this.db
      .select({
        gameId: games.id,
        name: games.name,
        steamAppId: gameSourceLinks.externalId,
        currentRating: games.criticRating,
      })
      .from(games)
      .innerJoin(gameSourceLinks, eq(gameSourceLinks.gameId, games.id))
      .where(eq(gameSourceLinks.source, 'steam'));

    logger.log(`Found ${linkedGames.length} Steam-linked games`);

    const gameIdBySteamAppId = new Map(
      linkedGames.map((game) => [game.steamAppId, game]),
    );
    const steamAppIds = [...gameIdBySteamAppId.keys()];

    const updates: Array<{
      gameId: string;
      name: string | null;
      criticRating: number | null;
      criticRatingCount: number | null;
    }> = [];

    for (
      let offset = 0;
      offset < steamAppIds.length;
      offset += IGDB_BATCH_SIZE
    ) {
      const batch = steamAppIds.slice(offset, offset + IGDB_BATCH_SIZE);
      const ratings = await this.igdbApiClient.getCriticRatingsBySteamAppIds({
        steamAppIds: batch,
      });

      for (const rating of ratings) {
        const linkedGame = gameIdBySteamAppId.get(rating.steamAppId);
        if (!isDefined(linkedGame)) {
          continue;
        }

        const { criticRating, criticRatingCount } =
          extractIgdbCriticRating(rating);

        if (!isDefined(criticRating)) {
          continue;
        }

        updates.push({
          gameId: linkedGame.gameId,
          name: linkedGame.name,
          criticRating,
          criticRatingCount,
        });
      }

      logger.log(
        `Fetched ${Math.min(offset + IGDB_BATCH_SIZE, steamAppIds.length)}/${steamAppIds.length}`,
      );
    }

    logger.log(`${updates.length} games have an IGDB critic rating`);

    if (isNonEmptyArray(updates)) {
      logger.log('Sample of pending updates:');
      updates.slice(0, SAMPLE_SIZE).forEach((update) => {
        logger.log(
          `  - ${update.name ?? update.gameId}: ${update.criticRating}/100 from ${update.criticRatingCount} critics`,
        );
      });
    }

    if (dryRun) {
      logger.log(
        `[dry-run] Would write critic ratings to ${updates.length} games`,
      );
      return;
    }

    let processedCount = 0;

    for (const update of updates) {
      await this.db
        .update(games)
        .set({
          criticRating: update.criticRating,
          criticRatingCount: update.criticRatingCount,
        })
        .where(eq(games.id, update.gameId));

      processedCount++;
      if (processedCount % 100 === 0) {
        logger.log(`Progress: ${processedCount}/${updates.length}`);
      }
    }

    logger.log(`Wrote critic ratings to ${processedCount} games`);
  }

  @Option({
    flags: '--dry-run',
    description: 'Log what would change without writing',
  })
  parseDryRun(): boolean {
    return true;
  }
}
