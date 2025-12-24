import { createPrismaClient } from '@macgamingdb/server/database';
import { createLogger } from '@macgamingdb/server/utils/logger';
import { config } from 'dotenv';
import { calculateAveragePerformance } from '@macgamingdb/server/utils/calculateAveragePerformance';
import {
  type PerformanceRating,
  type GameReview,
} from '@macgamingdb/server/generated/prisma/client';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const prisma = createPrismaClient();
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

  const games = await prisma.game.findMany({
    where: { reviewCount: { gt: 0 } },
    include: {
      reviews: { select: { performance: true } },
    },
  });

  logger.log(`Processing ${games.length} games`);

  let processed = 0;
  for (const game of games) {
    const oldAvg = calculateAveragePerformance(game.reviews as GameReview[]);

    const newRating = mapToPerformance(oldAvg);

    await prisma.game.update({
      where: { id: game.id },
      data: { aggregatedPerformance: newRating },
    });

    processed++;
    if (processed % 100 === 0) {
      logger.log(`Processed ${processed}/${games.length}`);
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
  } finally {
    await prisma.$disconnect();
  }
}

main();
