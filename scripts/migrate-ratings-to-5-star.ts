import { createPrismaClient } from '@/lib/database/prisma';
import { config } from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const prisma = createPrismaClient();

async function migrateRatingsTo5Star() {
  console.log('🚀 Starting Migration from 0-4 to 0-5 Star Rating System...\n');

  // No longer need JSON file - calculate directly from database

  // Calculate conversion mapping directly from database
  console.log('🔍 Analyzing current EXCELLENT games for conversion...');
  
  const excellentGames = await prisma.game.findMany({
    where: {
      aggregatedPerformance: 'EXCELLENT',
      reviewCount: { gt: 0 },
    },
    include: {
      reviews: {
        select: { performance: true },
      },
    },
  });

  const performanceMap = {
    UNPLAYABLE: 0,
    BARELY_PLAYABLE: 1,
    PLAYABLE: 2,
    GOOD: 3,
    EXCELLENT: 4,
  };

  // Calculate actual scores and determine cutoff
  const excellentScores = excellentGames.map(game => {
    const sum = game.reviews.reduce((acc, review) => {
      return acc + (performanceMap[review.performance as keyof typeof performanceMap] || 0);
    }, 0);
    return {
      gameId: game.id,
      score: sum / game.reviews.length,
      reviewCount: game.reviews.length,
    };
  });

  excellentScores.sort((a, b) => b.score - a.score);
  const cutoffScore = 4.0; // Perfect scores stay EXCELLENT
  
  const excellentStayExcellent = excellentScores.filter(g => g.score >= cutoffScore).map(g => g.gameId);
  const excellentToVeryGood = excellentScores.filter(g => g.score < cutoffScore).map(g => g.gameId);

  const mappingData = {
    cutoffScore,
    excellentToVeryGood,
    excellentStayExcellent,
  };
  
  console.log('📋 Migration Plan:');
  console.log(`- Games staying EXCELLENT (5★): ${mappingData.excellentStayExcellent.length}`);
  console.log(`- Games becoming VERY_GOOD (4★): ${mappingData.excellentToVeryGood.length}`);
  console.log(`- Cutoff score: ${mappingData.cutoffScore}\n`);

  // Step 1: Update games that should become VERY_GOOD
  console.log('🔄 Step 1: Converting EXCELLENT games to VERY_GOOD...');
  
  const veryGoodUpdateResult = await prisma.game.updateMany({
    where: {
      id: {
        in: mappingData.excellentToVeryGood,
      },
      aggregatedPerformance: 'EXCELLENT', // Safety check
    },
    data: {
      aggregatedPerformance: 'VERY_GOOD',
    },
  });

  console.log(`✅ Updated ${veryGoodUpdateResult.count} games to VERY_GOOD`);

  // Step 2: Verify games staying EXCELLENT
  console.log('\n🔄 Step 2: Verifying EXCELLENT games remain unchanged...');
  
  const remainingExcellentCount = await prisma.game.count({
    where: {
      id: {
        in: mappingData.excellentStayExcellent,
      },
      aggregatedPerformance: 'EXCELLENT',
    },
  });

  console.log(`✅ Verified ${remainingExcellentCount} games staying as EXCELLENT`);

  // Step 3: Update performance stats (clear old, will be regenerated)
  console.log('\n🔄 Step 3: Clearing old performance stats for regeneration...');
  
  await prisma.performanceStats.deleteMany({});
  console.log('✅ Performance stats cleared (will be regenerated)');

  // Step 4: Verify migration results
  console.log('\n📊 Step 4: Verifying migration results...');
  
  const finalDistribution = await prisma.game.groupBy({
    by: ['aggregatedPerformance'],
    _count: { aggregatedPerformance: true },
    where: { aggregatedPerformance: { not: null } },
    orderBy: { aggregatedPerformance: 'asc' },
  });

  console.log('\n🎯 Final Rating Distribution:');
  let total = 0;
  finalDistribution.forEach(item => {
    total += item._count.aggregatedPerformance;
    const stars = getStarsForRating(item.aggregatedPerformance!);
    console.log(`${stars} ${item.aggregatedPerformance}: ${item._count.aggregatedPerformance} games`);
  });

  console.log(`\nTotal games: ${total}`);

  // Step 5: Regenerate performance stats with new mapping
  console.log('\n🔄 Step 5: Regenerating performance stats with 5-star system...');
  
  // Note: This would typically call your existing performance stats generation logic
  console.log('⚠️  Run the performance stats regeneration script after this migration');

  console.log('\n✅ Migration Complete!');
  console.log('\nNext steps:');
  console.log('1. Generate new Prisma client: npx prisma generate');
  console.log('2. Run performance stats regeneration');
  console.log('3. Test frontend components');
  console.log('4. Verify SEO schema markup');

  await prisma.$disconnect();
}

function getStarsForRating(rating: string): string {
  const starMap: { [key: string]: string } = {
    'UNPLAYABLE': '0★',
    'BARELY_PLAYABLE': '1★',
    'PLAYABLE': '2★',
    'GOOD': '3★',
    'VERY_GOOD': '4★',
    'EXCELLENT': '5★',
  };
  return starMap[rating] || '?★';
}

// Safety check before running
async function runWithSafety() {
  try {
    // Check if we're in a safe environment
    const totalGames = await prisma.game.count();
    console.log(`Database contains ${totalGames} games`);
    
    if (totalGames === 0) {
      console.error('❌ No games found in database. Aborting migration.');
      process.exit(1);
    }

    // Confirm this is the right database
    console.log('⚠️  This will permanently modify your database.');
    console.log('⚠️  Make sure you have a backup before proceeding.');
    
    // In production, add an interactive confirmation
    // For now, proceed automatically
    await migrateRatingsTo5Star();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runWithSafety();