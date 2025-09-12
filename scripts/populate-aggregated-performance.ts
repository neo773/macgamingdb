import { createPrismaClient } from '@/lib/database/prisma';
import { GameReview } from '@prisma/client';
import { config } from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const prisma = createPrismaClient();

// Helper function to calculate average performance (copied from utils)
const calculateAveragePerformance = (reviews: GameReview[]) => {
  const performanceMap = {
    UNPLAYABLE: 0,
    BARELY_PLAYABLE: 1,
    PLAYABLE: 2,
    GOOD: 3,
    EXCELLENT: 4,
  };

  const sum = reviews.reduce((acc, review) => {
    return (
      acc +
      (performanceMap[review.performance as keyof typeof performanceMap] || 0)
    );
  }, 0);

  return reviews.length > 0 ? sum / reviews.length : 0;
};

// Convert average score to performance rating
const scoreToRating = (score: number) => {
  if (score >= 3.5) return 'EXCELLENT';
  if (score >= 2.5) return 'GOOD';
  if (score >= 1.5) return 'PLAYABLE';
  if (score >= 0.5) return 'BARELY_PLAYABLE';
  return 'UNPLAYABLE';
};

async function populateAggregatedPerformance() {
  console.log('🚀 Populating aggregatedPerformance for all games...');

  // Get all games with their reviews
  const games = await prisma.game.findMany({
    include: {
      reviews: true,
    },
  });

  console.log(`📊 Found ${games.length} games to process`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const game of games) {
    if (game.reviews.length === 0) {
      skippedCount++;
      continue;
    }

    // Calculate average performance
    const avgScore = calculateAveragePerformance(game.reviews);
    const aggregatedPerformance = scoreToRating(avgScore);

    // Update the game
    await prisma.game.update({
      where: { id: game.id },
      data: { aggregatedPerformance },
    });

    updatedCount++;

    if (updatedCount % 50 === 0) {
      console.log(`📊 Processed ${updatedCount} games...`);
    }
  }

  console.log(`✅ Processing complete!`);
  console.log(`🔄 Games updated: ${updatedCount}`);
  console.log(`⏭️  Games skipped (no reviews): ${skippedCount}`);

  // Show some statistics
  const perfCounts = await prisma.game.groupBy({
    by: ['aggregatedPerformance'],
    _count: { id: true },
  });

  console.log(`\n📈 Performance distribution:`);
  perfCounts.forEach(({ aggregatedPerformance, _count }) => {
    console.log(`${aggregatedPerformance || 'NULL'}: ${_count.id} games`);
  });
}

async function main() {
  try {
    await populateAggregatedPerformance();
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
