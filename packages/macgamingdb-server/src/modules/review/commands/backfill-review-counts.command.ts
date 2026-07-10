import { Inject } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { count, eq } from 'drizzle-orm';
import { isNonEmptyArray } from '@sniptt/guards';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { games, gameReviews } from '../../../database/schema';
import { createLogger } from '../../../engine/core-modules/logger/create-logger.util';

const logger = createLogger('BackfillReviewCounts');

type BackfillReviewCountsOptions = {
  dryRun?: boolean;
};

@Command({
  name: 'backfill-review-counts',
  description: 'Recompute and persist the reviewCount for every game',
})
export class BackfillReviewCountsCommand extends CommandRunner {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: BackfillReviewCountsOptions,
  ): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    logger.log('Adding reviewCount field and populating data');

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(gameReviews);
    logger.log(`Total reviews in database: ${totalResult.count}`);

    const allGames = await this.db.select().from(games);
    logger.log(`Found ${allGames.length} games to update`);

    const reviewCounts = await this.db
      .select({
        gameId: gameReviews.gameId,
        reviewCount: count(),
      })
      .from(gameReviews)
      .groupBy(gameReviews.gameId);

    const countMap = new Map(
      reviewCounts.map((review) => [review.gameId, review.reviewCount]),
    );

    const gamesWithReviews = allGames.filter(
      (game) => (countMap.get(game.id) ?? 0) > 0,
    );
    logger.log(`Games with reviews: ${gamesWithReviews.length}`);

    if (isNonEmptyArray(gamesWithReviews)) {
      logger.log('Sample games with reviews:');
      gamesWithReviews.slice(0, 5).forEach((game) => {
        logger.log(
          `  - Game ${game.id}: ${countMap.get(game.id)} reviews (current reviewCount: ${game.reviewCount})`,
        );
      });
    }

    if (dryRun) {
      logger.log(
        `[dry-run] Would update reviewCount on ${allGames.length} games`,
      );
      return;
    }

    let processedCount = 0;

    for (const game of allGames) {
      const reviewCount = countMap.get(game.id) ?? 0;
      await this.db
        .update(games)
        .set({ reviewCount })
        .where(eq(games.id, game.id));

      processedCount++;
      if (processedCount % 100 === 0) {
        const progress = ((processedCount / allGames.length) * 100).toFixed(1);
        logger.log(
          `Progress: ${processedCount}/${allGames.length} (${progress}%)`,
        );
      }
    }

    logger.log(
      `Successfully updated ${processedCount} games with review counts`,
    );
  }

  @Option({
    flags: '--dry-run',
    description: 'Log what would change without writing',
  })
  parseDryRun(): boolean {
    return true;
  }
}
