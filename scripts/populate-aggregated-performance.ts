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
  logger.log('Populating aggregatedPerformance for all games');

  const allGames = await db.query.games.findMany({
    with: {
      reviews: true,
    },
  });

  logger.log(`Found ${allGames.length} games to process`);

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
      logger.log(`Processed ${updatedCount} games`);
    }
  }

  logger.log('Processing complete');
  logger.log(`Games updated: ${updatedCount}`);
  logger.log(`Games skipped (no reviews): ${skippedCount}`);

  const perfCounts = await db
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

async function main() {
  try {
    await populateAggregatedPerformance();
  } catch (error) {
    logger.error('Script failed', error instanceof Error ? error.stack : String(error));
    process.exit(1);
  }
}

main();
