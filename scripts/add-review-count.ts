import { createDrizzleClient } from '@macgamingdb/server/database';
import { createLogger } from '@macgamingdb/server/utils/logger';
import { config } from 'dotenv';
import { games, gameReviews } from '@macgamingdb/server/drizzle/schema';
import { eq, count } from 'drizzle-orm';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const db = createDrizzleClient();
const logger = createLogger('AddReviewCount');

async function addReviewCount() {
  logger.info('Adding reviewCount field and populating data');

  const [totalResult] = await db.select({ count: count() }).from(gameReviews);
  logger.info(`Total reviews in database: ${totalResult.count}`);

  const allGames = await db.select().from(games);
  logger.info(`Found ${allGames.length} games to update`);

  // Get review counts per game
  const reviewCounts = await db
    .select({
      gameId: gameReviews.gameId,
      reviewCount: count(),
    })
    .from(gameReviews)
    .groupBy(gameReviews.gameId);

  const countMap = new Map(reviewCounts.map((r) => [r.gameId, r.reviewCount]));

  const gamesWithReviews = allGames.filter((game) => (countMap.get(game.id) ?? 0) > 0);
  logger.info(`Games with reviews: ${gamesWithReviews.length}`);

  if (gamesWithReviews.length > 0) {
    logger.info('Sample games with reviews:');
    gamesWithReviews.slice(0, 5).forEach((game) => {
      logger.info(
        `  - Game ${game.id}: ${countMap.get(game.id)} reviews (current reviewCount: ${game.reviewCount})`,
      );
    });
  }

  let processedCount = 0;

  for (const game of allGames) {
    const reviewCount = countMap.get(game.id) ?? 0;
    await db
      .update(games)
      .set({ reviewCount })
      .where(eq(games.id, game.id));

    processedCount++;
    if (processedCount % 100 === 0) {
      const progress = ((processedCount / allGames.length) * 100).toFixed(1);
      logger.info(`Progress: ${processedCount}/${allGames.length} (${progress}%)`);
    }
  }

  logger.info(`Successfully updated ${processedCount} games with review counts`);
}

async function main() {
  try {
    await addReviewCount();
  } catch (error) {
    logger.error({ err: error }, 'Script failed');
    process.exit(1);
  }
}

main();
