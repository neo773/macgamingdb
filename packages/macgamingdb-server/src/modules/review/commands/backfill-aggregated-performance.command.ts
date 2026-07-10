import { Inject } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { count, eq, isNotNull } from 'drizzle-orm';
import { isNonEmptyArray } from '@sniptt/guards';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { games } from '../../../database/schema';
import { createLogger } from '../../../engine/core-modules/logger/create-logger.util';
import { calculateAveragePerformance } from '../utils/calculate-average-performance.util';
import { scoreToRating } from '../utils/score-to-rating.util';

const logger = createLogger('BackfillAggregatedPerformance');

type BackfillAggregatedPerformanceOptions = {
  dryRun?: boolean;
};

@Command({
  name: 'backfill-aggregated-performance',
  description: 'Recompute and persist the aggregatedPerformance for every game',
})
export class BackfillAggregatedPerformanceCommand extends CommandRunner {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: BackfillAggregatedPerformanceOptions,
  ): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    logger.log('Populating aggregatedPerformance for all games');

    const allGames = await this.db.query.games.findMany({
      with: {
        reviews: true,
      },
    });

    logger.log(`Found ${allGames.length} games to process`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const game of allGames) {
      if (!isNonEmptyArray(game.reviews)) {
        skippedCount++;
        continue;
      }

      const averageScore = calculateAveragePerformance(game.reviews);
      const aggregatedPerformance = scoreToRating(averageScore);

      if (!dryRun) {
        await this.db
          .update(games)
          .set({ aggregatedPerformance })
          .where(eq(games.id, game.id));
      }

      updatedCount++;

      if (updatedCount % 100 === 0) {
        logger.log(`Processed ${updatedCount} games`);
      }
    }

    if (dryRun) {
      logger.log(
        `[dry-run] Would update ${updatedCount} games, skip ${skippedCount} without reviews`,
      );
      return;
    }

    logger.log('Processing complete');
    logger.log(`Games updated: ${updatedCount}`);
    logger.log(`Games skipped (no reviews): ${skippedCount}`);

    const perfCounts = await this.db
      .select({
        aggregatedPerformance: games.aggregatedPerformance,
        count: count(),
      })
      .from(games)
      .where(isNotNull(games.aggregatedPerformance))
      .groupBy(games.aggregatedPerformance);

    logger.log('Performance distribution:');
    perfCounts.forEach(({ aggregatedPerformance, count: cnt }) => {
      logger.log(`${aggregatedPerformance || 'NULL'}: ${cnt} games`);
    });
  }

  @Option({
    flags: '--dry-run',
    description: 'Log what would change without writing',
  })
  parseDryRun(): boolean {
    return true;
  }
}
