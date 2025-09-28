import { createPrismaClient } from '@/lib/database/prisma';
import { config } from 'dotenv';
import { calculateAveragePerformance } from '@/server/utils/calculateAveragePerformance';
import { type PerformanceRating, type GameReview } from '@prisma/client';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const prisma = createPrismaClient();

// --- Local helpers (migration-only) ---
const convertScore = (score: number, oldMax = 4, newMax = 5): number => {
  return (score / oldMax) * newMax;
};

const mapToPerformance = (oldScore: number): PerformanceRating => {
  const rescaled = convertScore(oldScore);

  // Preserve EXCELLENT membership from old system
  if (oldScore >= 3.5) return 'EXCELLENT';

  if (rescaled >= 4.5) return 'EXCELLENT';
  if (rescaled >= 3.5) return 'VERY_GOOD';
  if (rescaled >= 2.5) return 'GOOD';
  if (rescaled >= 1.5) return 'PLAYABLE';
  if (rescaled >= 0.5) return 'BARELY_PLAYABLE';
  return 'UNPLAYABLE';
};

// --- Migration ---
async function migrateTo05RatingScale() {
  console.log('🚀 Clean Migration: 0–4 ➝ 0–5 Star System\n');

  // Get all games with reviews
  const games = await prisma.game.findMany({
    where: { reviewCount: { gt: 0 } },
    include: {
      reviews: { select: { performance: true } },
    },
  });

  console.log(`🔄 Processing ${games.length} games...\n`);

  let processed = 0;
  for (const game of games) {
    // Old average score (0–4 scale)
    const oldAvg = calculateAveragePerformance(game.reviews as GameReview[]);

    // Map to new performance category (0–5 scale, preserving EXCELLENT)
    const newRating = mapToPerformance(oldAvg);

    await prisma.game.update({
      where: { id: game.id },
      data: { aggregatedPerformance: newRating },
    });

    processed++;
    if (processed % 100 === 0) {
      console.log(`  ✅ Processed ${processed}/${games.length}`);
    }
  }

  console.log(`\n✅ Recalculated ${processed} games`);

  await prisma.$disconnect();
}

migrateTo05RatingScale().catch((err) => {
  console.error(err);
  prisma.$disconnect();
});
