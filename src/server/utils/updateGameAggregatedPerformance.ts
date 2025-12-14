import type { PrismaClient } from '@/generated/prisma/client';
import type { Performance } from '../schema';
import { calculateAveragePerformance } from './calculateAveragePerformance';
import { scoreToRating } from './scoreToRating';

export const updateGameAggregatedPerformance = async (
  prisma: PrismaClient,
  gameId: string
) => {
  const reviews = await prisma.gameReview.findMany({
    where: { gameId },
    select: { performance: true },
  });

  let aggregatedPerformance: Performance | null = null;
  if (reviews.length > 0) {
    const avgScore = calculateAveragePerformance(reviews);
    aggregatedPerformance = scoreToRating(avgScore);
  }

  await prisma.game.update({
    where: { id: gameId },
    data: { aggregatedPerformance },
  });

  return aggregatedPerformance;
};
