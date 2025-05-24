import { createPrismaClient } from "@/lib/database/prisma";
import { config } from "dotenv";



console.log(process.env.LIBSQL_DATABASE_URL, "LIBSQL_DATABASE_URL")
const prisma = createPrismaClient();

async function addReviewCount() {
  console.log("🚀 Adding reviewCount field and populating data...");

  // Get all games with their review counts
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

  // Prepare bulk update operations
  const updateOperations = games.map(game => 
    prisma.game.update({
      where: { id: game.id },
      data: { reviewCount: game._count.reviews },
    })
  );

  console.log(`📊 Preparing to update ${updateOperations.length} games in bulk...`);

  // Execute all updates in a transaction for better performance and atomicity
  const results = await prisma.$transaction(updateOperations);

  console.log(
    `✅ Successfully updated ${results.length} games with review counts`
  );

  // Show distribution
  const countDistribution = await prisma.game.groupBy({
    by: ["reviewCount"],
    _count: { id: true },
    orderBy: { reviewCount: "desc" },
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
    console.error("💥 Script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
