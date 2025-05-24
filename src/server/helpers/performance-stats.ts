import type { PrismaClient } from "@prisma/client";
import type { Chipset, ChipsetVariant, PlayMethod, Performance } from "../schema";

// Helper function to count games matching specific performance criteria
export const countGamesForPerformanceStats = async (
  prisma: PrismaClient,
  criteria: {
    chipset?: Chipset | "ALL";
    chipsetVariant?: ChipsetVariant;
    playMethod?: PlayMethod | "OTHER";
    performanceRating: Performance;
  }
) => {
  const { chipset, chipsetVariant, playMethod, performanceRating } = criteria;

  // If chipset is "ALL" and playMethod is "OTHER", count all games with this performance
  if (chipset === "ALL" && playMethod === "OTHER") {
    return await prisma.game.count({
      where: {
        aggregatedPerformance: performanceRating,
      },
    });
  }

  // If chipset is "ALL" but playMethod is specific, count games with reviews from that play method
  if (chipset === "ALL" && playMethod !== "OTHER") {
    return await prisma.game.count({
      where: {
        aggregatedPerformance: performanceRating,
        reviews: {
          some: {
            playMethod,
          },
        },
      },
    });
  }

  // If playMethod is "OTHER", count games with reviews from this chipset (any method)
  if (playMethod === "OTHER") {
    return await prisma.game.count({
      where: {
        aggregatedPerformance: performanceRating,
        reviews: {
          some: {
            chipset,
            chipsetVariant,
          },
        },
      },
    });
  }

  // Specific combination: count games with exact chipset, variant, and play method
  return await prisma.game.count({
    where: {
      aggregatedPerformance: performanceRating,
      reviews: {
        some: {
          chipset,
          chipsetVariant,
          playMethod,
        },
      },
    },
  });
};

// Helper function to upsert a performance stats record
export const upsertPerformanceStats = async (
  prisma: PrismaClient,
  stats: {
    chipset: Chipset | "ALL";
    chipsetVariant: ChipsetVariant;
    playMethod: PlayMethod | "OTHER";
    performanceRating: Performance;
    count: number;
  }
) => {
  return await prisma.performanceStats.upsert({
    where: {
      chipset_chipsetVariant_playMethod_performanceRating: {
        chipset: stats.chipset,
        chipsetVariant: stats.chipsetVariant,
        playMethod: stats.playMethod,
        performanceRating: stats.performanceRating,
      },
    },
    update: { count: stats.count },
    create: {
      chipset: stats.chipset,
      chipsetVariant: stats.chipsetVariant,
      playMethod: stats.playMethod,
      performanceRating: stats.performanceRating,
      count: stats.count,
    },
  });
};

// Helper function to update performance stats for a specific combination
export const updateSpecificPerformanceStats = async (
  prisma: PrismaClient,
  chipset: Chipset,
  chipsetVariant: ChipsetVariant,
  playMethod: PlayMethod,
  performanceRating: Performance
) => {
  const count = await countGamesForPerformanceStats(prisma, {
    chipset,
    chipsetVariant,
    playMethod,
    performanceRating,
  });

  await upsertPerformanceStats(prisma, {
    chipset,
    chipsetVariant,
    playMethod,
    performanceRating,
    count,
  });
};

// Helper function to update aggregate performance stats
export const updateAggregatePerformanceStats = async (
  prisma: PrismaClient,
  chipset: Chipset,
  chipsetVariant: ChipsetVariant,
  performanceRating: Performance
) => {
  // Update specific chipset + "OTHER" (all methods) combination
  const chipsetAllMethodsCount = await countGamesForPerformanceStats(prisma, {
    chipset,
    chipsetVariant,
    playMethod: "OTHER",
    performanceRating,
  });

  await upsertPerformanceStats(prisma, {
    chipset,
    chipsetVariant,
    playMethod: "OTHER",
    performanceRating,
    count: chipsetAllMethodsCount,
  });

  // Update "ALL" chipset + "OTHER" (all methods) combination
  const allChipsetsAllMethodsCount = await countGamesForPerformanceStats(prisma, {
    chipset: "ALL",
    chipsetVariant: "BASE" as ChipsetVariant,
    playMethod: "OTHER",
    performanceRating,
  });

  await upsertPerformanceStats(prisma, {
    chipset: "ALL",
    chipsetVariant: "BASE" as ChipsetVariant,
    playMethod: "OTHER",
    performanceRating,
    count: allChipsetsAllMethodsCount,
  });
};

// Helper function to update "ALL" chipset + specific playMethod combination
export const updateAllChipsetSpecificMethodStats = async (
  prisma: PrismaClient,
  playMethod: PlayMethod,
  performanceRating: Performance
) => {
  const count = await countGamesForPerformanceStats(prisma, {
    chipset: "ALL",
    chipsetVariant: "BASE" as ChipsetVariant,
    playMethod,
    performanceRating,
  });

  await upsertPerformanceStats(prisma, {
    chipset: "ALL",
    chipsetVariant: "BASE" as ChipsetVariant,
    playMethod,
    performanceRating,
    count,
  });
};

// Main helper function to update all performance stats after a review change
export const updateAllPerformanceStatsForGame = async (
  prisma: PrismaClient,
  gameId: string,
  chipset: Chipset,
  chipsetVariant: ChipsetVariant,
  playMethod: PlayMethod
) => {
  // Update performance stats for all performance ratings that might be affected
  const allPerformanceRatings: Performance[] = ["UNPLAYABLE", "BARELY_PLAYABLE", "PLAYABLE", "GOOD", "EXCELLENT"];
  
  for (const performanceRating of allPerformanceRatings) {
    // Update specific combination
    await updateSpecificPerformanceStats(prisma, chipset, chipsetVariant, playMethod, performanceRating);
    
    // Update aggregate combinations
    await updateAggregatePerformanceStats(prisma, chipset, chipsetVariant, performanceRating);
    
    // Update "ALL" chipset + specific playMethod combination
    await updateAllChipsetSpecificMethodStats(prisma, playMethod, performanceRating);
  }
}; 