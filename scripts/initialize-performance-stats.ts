import {
  ChipsetEnum,
  ChipsetVariantEnum,
  PlayMethodEnum,
  PerformanceEnum,
  type ChipsetVariant,
  type PlayMethod,
  type Performance,
} from "../src/server/schema/index.js";
import {
  countGamesForPerformanceStats,
  upsertPerformanceStats,
} from "../src/server/helpers/performance-stats.js";
import { createPrismaClient } from "@/lib/database/prisma";
import { config } from "dotenv";

if (process.env.NODE_ENV === 'production') {
  config({
    path: "../.env.prod",
  });
}

const prisma = createPrismaClient();


async function initializePerformanceStats() {
  console.log("🚀 Initializing PerformanceStats table...");
  console.log("📊 Counting unique games for each combination...");

  // Get all possible combinations from enums
  const chipsets = ChipsetEnum.options;
  const chipsetVariants = ChipsetVariantEnum.options;
  const playMethods = [...PlayMethodEnum.options, "OTHER"] as const;
  const performanceRatings = PerformanceEnum.options;

  let totalCombinations = 0;
  let createdCount = 0;
  let updatedCount = 0;

  // Process regular combinations - count games for each specific combination
  for (const chipset of chipsets) {
    for (const chipsetVariant of chipsetVariants) {
      for (const playMethod of playMethods) {
        for (const performanceRating of performanceRatings) {
          totalCombinations++;

          try {
            // Use shared helper to count games
            const gameCount = await countGamesForPerformanceStats(prisma, {
              chipset,
              chipsetVariant: chipsetVariant as ChipsetVariant,
              playMethod: playMethod as PlayMethod,
              performanceRating: performanceRating as Performance,
            });

            const existingRecord = await prisma.performanceStats.findUnique({
              where: {
                chipset_chipsetVariant_playMethod_performanceRating: {
                  chipset,
                  chipsetVariant: chipsetVariant as ChipsetVariant,
                  playMethod: playMethod as PlayMethod,
                  performanceRating: performanceRating as Performance,
                },
              },
            });

            // Use shared helper to upsert the record
            await upsertPerformanceStats(prisma, {
              chipset,
              chipsetVariant: chipsetVariant as ChipsetVariant,
              playMethod: playMethod as PlayMethod,
              performanceRating: performanceRating as Performance,
              count: gameCount,
            });

            if (existingRecord) {
              updatedCount++;
            } else {
              createdCount++;
            }

            if (totalCombinations % 50 === 0) {
              console.log(`📊 Processed ${totalCombinations} combinations...`);
            }
          } catch (error) {
            console.error(
              `❌ Error processing combination: ${chipset}-${chipsetVariant}-${playMethod}-${performanceRating}`,
              error
            );
          }
        }
      }
    }
  }

  // Create aggregate "ALL" combinations
  console.log("📊 Creating aggregate 'ALL' combinations...");

  // 1. chipset "ALL", playMethod "OTHER" (represents ALL playMethods) - count games with performance rating regardless of chipset/method
  for (const performanceRating of performanceRatings) {
    try {
      const gameCount = await countGamesForPerformanceStats(prisma, {
        chipset: "ALL",
        chipsetVariant: "BASE" as ChipsetVariant,
        playMethod: "OTHER",
        performanceRating: performanceRating as Performance,
      });

      const existingRecord = await prisma.performanceStats.findUnique({
        where: {
          chipset_chipsetVariant_playMethod_performanceRating: {
            chipset: "ALL",
            chipsetVariant: "BASE" as ChipsetVariant,
            playMethod: "OTHER" as PlayMethod,
            performanceRating: performanceRating as Performance,
          },
        },
      });

      await upsertPerformanceStats(prisma, {
        chipset: "ALL",
        chipsetVariant: "BASE" as ChipsetVariant,
        playMethod: "OTHER",
        performanceRating: performanceRating as Performance,
        count: gameCount,
      });

      if (existingRecord) {
        updatedCount++;
      } else {
        createdCount++;
      }
      totalCombinations++;
    } catch (error) {
      console.error(
        `❌ Error creating ALL-OTHER aggregate for ${performanceRating}:`,
        error
      );
    }
  }

  // 2. chipset "ALL", specific playMethods - count games with performance rating that have at least one review from that play method
  for (const playMethod of playMethods) {
    // Skip OTHER since we already used it for the ALL playMethods case above
    if (playMethod === "OTHER") continue;

    for (const performanceRating of performanceRatings) {
      try {
        const gameCount = await countGamesForPerformanceStats(prisma, {
          chipset: "ALL",
          chipsetVariant: "BASE" as ChipsetVariant,
          playMethod: playMethod as PlayMethod,
          performanceRating: performanceRating as Performance,
        });

        const existingRecord = await prisma.performanceStats.findUnique({
          where: {
            chipset_chipsetVariant_playMethod_performanceRating: {
              chipset: "ALL",
              chipsetVariant: "BASE" as ChipsetVariant,
              playMethod: playMethod as PlayMethod,
              performanceRating: performanceRating as Performance,
            },
          },
        });

        await upsertPerformanceStats(prisma, {
          chipset: "ALL",
          chipsetVariant: "BASE" as ChipsetVariant,
          playMethod: playMethod as PlayMethod,
          performanceRating: performanceRating as Performance,
          count: gameCount,
        });

        if (existingRecord) {
          updatedCount++;
        } else {
          createdCount++;
        }
        totalCombinations++;
      } catch (error) {
        console.error(
          `❌ Error creating chipset ALL aggregate for ${playMethod}-${performanceRating}:`,
          error
        );
      }
    }
  }

  // 3. specific chipset combinations with playMethod "OTHER" (represents ALL playMethods for that chipset)
  console.log(
    "📊 Creating specific chipset + 'OTHER' play method combinations..."
  );
  for (const chipset of chipsets) {
    for (const chipsetVariant of chipsetVariants) {
      for (const performanceRating of performanceRatings) {
        try {
          // Use shared helper to count games
          const gameCount = await countGamesForPerformanceStats(prisma, {
            chipset,
            chipsetVariant: chipsetVariant as ChipsetVariant,
            playMethod: "OTHER",
            performanceRating: performanceRating as Performance,
          });

          const existingRecord = await prisma.performanceStats.findUnique({
            where: {
              chipset_chipsetVariant_playMethod_performanceRating: {
                chipset,
                chipsetVariant: chipsetVariant as ChipsetVariant,
                playMethod: "OTHER" as PlayMethod,
                performanceRating: performanceRating as Performance,
              },
            },
          });

          await upsertPerformanceStats(prisma, {
            chipset,
            chipsetVariant: chipsetVariant as ChipsetVariant,
            playMethod: "OTHER",
            performanceRating: performanceRating as Performance,
            count: gameCount,
          });

          if (existingRecord) {
            updatedCount++;
          } else {
            createdCount++;
          }
          totalCombinations++;

          if (totalCombinations % 25 === 0) {
            console.log(
              `📊 Processed ${totalCombinations} total combinations...`
            );
          }
        } catch (error) {
          console.error(
            `❌ Error creating ${chipset}-${chipsetVariant}-OTHER-${performanceRating}:`,
            error
          );
        }
      }
    }
  }

  console.log(`✅ Initialization complete!`);
  console.log(`📊 Total combinations processed: ${totalCombinations}`);
  console.log(`🆕 New records created: ${createdCount}`);
  console.log(`🔄 Existing records updated: ${updatedCount}`);

  // Show some statistics
  const totalRecords = await prisma.performanceStats.count();
  const nonZeroRecords = await prisma.performanceStats.count({
    where: { count: { gt: 0 } },
  });

  console.log(`📈 Total records in PerformanceStats: ${totalRecords}`);
  console.log(`🎯 Records with actual games: ${nonZeroRecords}`);
  console.log(`📊 Records with zero games: ${totalRecords - nonZeroRecords}`);

  // Show aggregate statistics
  const allChipsetRecords = await prisma.performanceStats.findMany({
    where: { chipset: "ALL" },
    orderBy: { count: "desc" },
  });

  if (allChipsetRecords.length > 0) {
    console.log(`\n🌟 Aggregate "ALL" combinations:`);
    allChipsetRecords
      .filter(({ count }) => count > 0)
      .slice(0, 5)
      .forEach(
        (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          { chipset, chipsetVariant, playMethod, performanceRating, count },
          index
        ) => {
          // Display "ALL" for playMethod "OTHER" when chipset is "ALL" to show user-friendly output
          const displayPlayMethod = playMethod === "OTHER" ? "ALL" : playMethod;
          console.log(
            `${index + 1}. ALL ${chipsetVariant} + ${displayPlayMethod} + ${performanceRating}: ${count} games`
          );
        }
      );
  }

  // Show top combinations
  const topCombinations = await prisma.performanceStats.findMany({
    where: {
      count: { gt: 0 },
      chipset: { not: "ALL" },
    },
    orderBy: { count: "desc" },
    take: 5,
  });

  if (topCombinations.length > 0) {
    console.log(`\n🏆 Top 5 specific combinations by game count:`);
    topCombinations.forEach(
      (
        { chipset, chipsetVariant, playMethod, performanceRating, count },
        index
      ) => {
        console.log(
          `${index + 1}. ${chipset} ${chipsetVariant} + ${playMethod} + ${performanceRating}: ${count} games`
        );
      }
    );
  }
}

async function main() {
  try {
    await initializePerformanceStats();
  } catch (error) {
    console.error("💥 Script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
