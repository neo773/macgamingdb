import { createPrismaClient } from '@/lib/database/prisma';
import { calculateAveragePerformance } from '@/server/utils/calculateAveragePerformance';
import { scoreToRating } from '@/server/utils/scoreToRating';

import { config } from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const prisma = createPrismaClient();

async function populateAggregatedPerformance() {
  console.log('🚀 Populating aggregatedPerformance for all games...');

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

    const avgScore = calculateAveragePerformance(game.reviews);
    const aggregatedPerformance = scoreToRating(avgScore);

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
