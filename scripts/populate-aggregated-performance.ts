import { createPrismaClient } from '@macgamingdb/server/database';
import { calculateAveragePerformance } from '@macgamingdb/server/utils/calculateAveragePerformance';
import { scoreToRating } from '@macgamingdb/server/utils/scoreToRating';
import { createLogger } from '@macgamingdb/server/utils/logger';
import { config } from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const prisma = createPrismaClient();
const logger = createLogger('PopulateAggregatedPerformance');

async function populateAggregatedPerformance() {
  logger.log('Populating aggregatedPerformance for all games');

  const games = await prisma.game.findMany({
    include: {
      reviews: true,
    },
  });

  logger.log(`Found ${games.length} games to process`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const game of games) {
    if (game.reviews.length === 0) {
      skippedCount++;
      continue;
    }

    const avgScore = calculateAveragePerformance(game.reviews);
    const aggregatedPerformance = scoreToRating(avgScore);

    await prisma.game.update({
      where: { id: game.id },
      data: { aggregatedPerformance },
    });

    updatedCount++;

    if (updatedCount % 100 === 0) {
      logger.log(`Processed ${updatedCount} games`);
    }
  }

  logger.log('Processing complete');
  logger.log(`Games updated: ${updatedCount}`);
  logger.log(`Games skipped (no reviews): ${skippedCount}`);

  const perfCounts = await prisma.game.groupBy({
    by: ['aggregatedPerformance'],
    _count: { id: true },
  });

  logger.log('Performance distribution:');
  perfCounts.forEach(({ aggregatedPerformance, _count }) => {
    logger.log(`${aggregatedPerformance || 'NULL'}: ${_count.id} games`);
  });
}

async function main() {
  try {
    await populateAggregatedPerformance();
  } catch (error) {
    logger.error('Script failed', error instanceof Error ? error.stack : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
