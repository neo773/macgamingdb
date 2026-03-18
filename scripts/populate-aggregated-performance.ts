import { createDrizzleClient } from '@macgamingdb/server/database';
import { calculateAveragePerformance } from '@macgamingdb/server/utils/calculateAveragePerformance';
import { scoreToRating } from '@macgamingdb/server/utils/scoreToRating';
import { createLogger } from '@macgamingdb/server/utils/logger';
import { config } from 'dotenv';
import { games, gameReviews } from '@macgamingdb/server/drizzle/schema';
import { eq, count, isNotNull } from 'drizzle-orm';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const db = createDrizzleClient();
const logger = createLogger('PopulateAggregatedPerformance');

async function populateAggregatedPerformance() {
  logger.info('Populating aggregatedPerformance for all games');

  const allGames = await db.query.games.findMany({
    with: {
      reviews: true,
    },
  });

  logger.info(`Found ${allGames.length} games to process`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const game of allGames) {
    if (game.reviews.length === 0) {
      skippedCount++;
      continue;
    }

    const avgScore = calculateAveragePerformance(game.reviews);
    const aggregatedPerformance = scoreToRating(avgScore);

    await db
      .update(games)
      .set({ aggregatedPerformance })
      .where(eq(games.id, game.id));

    updatedCount++;

    if (updatedCount % 100 === 0) {
      logger.info(`Processed ${updatedCount} games`);
    }
  }

  logger.info('Processing complete');
  logger.info(`Games updated: ${updatedCount}`);
  logger.info(`Games skipped (no reviews): ${skippedCount}`);

  const perfCounts = await db
    .select({
      aggregatedPerformance: games.aggregatedPerformance,
      count: count(),
    })
    .from(games)
    .where(isNotNull(games.aggregatedPerformance))
    .groupBy(games.aggregatedPerformance);

  logger.info('Performance distribution:');
  perfCounts.forEach(({ aggregatedPerformance, count: cnt }) => {
    logger.info(`${aggregatedPerformance || 'NULL'}: ${cnt} games`);
  });
}

async function main() {
  try {
    await populateAggregatedPerformance();
  } catch (error) {
    logger.error({ err: error }, 'Script failed');
    process.exit(1);
  }
}

main();
