import { createPrismaClient } from '@/lib/database/prisma';
import { config } from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const prisma = createPrismaClient();

async function addReviewCount() {
  console.log('🚀 Adding reviewCount field and populating data...');

  const totalReviews = await prisma.gameReview.count();
  console.log(`📊 Total reviews in database: ${totalReviews}`);

  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  console.log(`📊 Found ${games.length} games to update`);

  const gamesWithReviews = games.filter((game) => game._count.reviews > 0);
  console.log(`📊 Games with reviews: ${gamesWithReviews.length}`);

  if (gamesWithReviews.length > 0) {
    console.log('Sample games with reviews:');
    gamesWithReviews.slice(0, 5).forEach((game) => {
      console.log(
        `  - Game ${game.id}: ${game._count.reviews} reviews (current reviewCount: ${game.reviewCount})`,
      );
    });
  } else {
    console.log('⚠️  No games have any reviews!');

    const sampleGames = games.slice(0, 3);
    for (const game of sampleGames) {
      const reviewCount = await prisma.gameReview.count({
        where: { gameId: game.id },
      });
      console.log(
        `  - Game ${game.id}: Direct count = ${reviewCount}, _count = ${game._count.reviews}`,
      );
    }
  }

  const BATCH_SIZE = 50;
  const totalGames = games.length;
  let processedCount = 0;

  console.log(
    `📊 Processing ${totalGames} games in batches of ${BATCH_SIZE}...`,
  );

  for (let i = 0; i < totalGames; i += BATCH_SIZE) {
    const batch = games.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(totalGames / BATCH_SIZE);

    console.log(
      `🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} games)...`,
    );

    const updateOperations = batch.map((game) =>
      prisma.game.update({
        where: { id: game.id },
        data: { reviewCount: game._count.reviews },
      }),
    );

    try {
      const batchResults = await prisma.$transaction(updateOperations);
      processedCount += batchResults.length;
      console.log(
        `✅ Batch ${batchNumber} completed: ${batchResults.length} games updated`,
      );

      const progress = ((processedCount / totalGames) * 100).toFixed(1);
      console.log(
        `📈 Progress: ${processedCount}/${totalGames} (${progress}%)`,
      );
    } catch (error) {
      console.error(`❌ Batch ${batchNumber} failed:`, error);
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(
    `✅ Successfully updated ${processedCount} games with review counts`,
  );

  console.log('\n🔍 Verifying updates...');
  const verificationGames = await prisma.game.findMany({
    where: {
      id: { in: games.slice(0, 5).map((g) => g.id) },
    },
    select: { id: true, reviewCount: true },
  });

  verificationGames.forEach((game) => {
    const originalGame = games.find((g) => g.id === game.id);
    console.log(
      `  - Game ${game.id}: Expected ${originalGame?._count.reviews}, Got ${game.reviewCount}`,
    );
  });

  const countDistribution = await prisma.game.groupBy({
    by: ['reviewCount'],
    _count: { id: true },
    orderBy: { reviewCount: 'desc' },
    take: 10,
  });

  console.log(`\n📈 Top review count distribution:`);
  countDistribution.forEach(({ reviewCount, _count }) => {
    console.log(`${reviewCount} reviews: ${_count.id} games`);
  });
}

async function main() {
  try {
    await addReviewCount();
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
