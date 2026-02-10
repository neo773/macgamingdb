import { createDrizzleClient } from '@macgamingdb/server/database';
import { createLogger } from '@macgamingdb/server/utils/logger';
import { config } from 'dotenv';
import { calculateAveragePerformance } from '@macgamingdb/server/utils/calculateAveragePerformance';
import { type PerformanceRating } from '@macgamingdb/server/drizzle/types';
import { games } from '@macgamingdb/server/drizzle/schema';
import { eq, gt } from 'drizzle-orm';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const db = createDrizzleClient();
const logger = createLogger('MigrateTo05RatingScale');

const convertScore = (score: number, oldMax = 4, newMax = 5): number => {
  return (score / oldMax) * newMax;
};

const mapToPerformance = (oldScore: number): PerformanceRating => {
  const rescaled = convertScore(oldScore);

  if (oldScore >= 3.5) return 'EXCELLENT';

  if (rescaled >= 4.5) return 'EXCELLENT';
  if (rescaled >= 3.5) return 'VERY_GOOD';
  if (rescaled >= 2.5) return 'GOOD';
  if (rescaled >= 1.5) return 'PLAYABLE';
  if (rescaled >= 0.5) return 'BARELY_PLAYABLE';
  return 'UNPLAYABLE';
};

async function migrateTo05RatingScale() {
  logger.log('Clean Migration: 0-4 to 0-5 Star System');

  const allGames = await db.query.games.findMany({
    where: gt(games.reviewCount, 0),
    with: {
      reviews: {
        columns: { performance: true },
      },
    },
  });

  logger.log(`Processing ${allGames.length} games`);

  let processed = 0;
  for (const game of allGames) {
    const oldAvg = calculateAveragePerformance(game.reviews);

    const newRating = mapToPerformance(oldAvg);

    await db
      .update(games)
      .set({ aggregatedPerformance: newRating })
      .where(eq(games.id, game.id));

    processed++;
    if (processed % 100 === 0) {
      logger.log(`Processed ${processed}/${allGames.length}`);
    }
  }

  logger.log(`Recalculated ${processed} games`);
}

async function main() {
  try {
    await migrateTo05RatingScale();
  } catch (error) {
    logger.error('Script failed', error instanceof Error ? error.stack : String(error));
    process.exit(1);
  }
}

main();
