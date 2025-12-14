import type { PrismaClient } from '@/generated/prisma/client';
import type {
  Chipset,
  ChipsetVariant,
  PlayMethod,
  Performance,
} from '../schema';

export const countGamesForPerformanceStats = async (
  prisma: PrismaClient,
  criteria: {
    chipset?: Chipset | 'ALL';
    chipsetVariant?: ChipsetVariant;
    playMethod?: PlayMethod | 'OTHER';
    performanceRating: Performance;
  },
) => {
  const { chipset, chipsetVariant, playMethod, performanceRating } = criteria;

  if (chipset === 'ALL' && playMethod === 'OTHER') {
    return await prisma.game.count({
      where: {
        aggregatedPerformance: performanceRating,
      },
    });
  }

  if (chipset === 'ALL' && playMethod !== 'OTHER') {
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

  if (playMethod === 'OTHER') {
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

export const upsertPerformanceStats = async (
  prisma: PrismaClient,
  stats: {
    chipset: Chipset | 'ALL';
    chipsetVariant: ChipsetVariant;
    playMethod: PlayMethod | 'OTHER';
    performanceRating: Performance;
    count: number;
  },
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

export const updateSpecificPerformanceStats = async (
  prisma: PrismaClient,
  chipset: Chipset,
  chipsetVariant: ChipsetVariant,
  playMethod: PlayMethod,
  performanceRating: Performance,
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

export const updateAggregatePerformanceStats = async (
  prisma: PrismaClient,
  chipset: Chipset,
  chipsetVariant: ChipsetVariant,
  performanceRating: Performance,
) => {
  const chipsetAllMethodsCount = await countGamesForPerformanceStats(prisma, {
    chipset,
    chipsetVariant,
    playMethod: 'OTHER',
    performanceRating,
  });

  await upsertPerformanceStats(prisma, {
    chipset,
    chipsetVariant,
    playMethod: 'OTHER',
    performanceRating,
    count: chipsetAllMethodsCount,
  });

  const allChipsetsAllMethodsCount = await countGamesForPerformanceStats(
    prisma,
    {
      chipset: 'ALL',
      chipsetVariant: 'BASE' as ChipsetVariant,
      playMethod: 'OTHER',
      performanceRating,
    },
  );

  await upsertPerformanceStats(prisma, {
    chipset: 'ALL',
    chipsetVariant: 'BASE' as ChipsetVariant,
    playMethod: 'OTHER',
    performanceRating,
    count: allChipsetsAllMethodsCount,
  });
};

export const updateAllChipsetSpecificMethodStats = async (
  prisma: PrismaClient,
  playMethod: PlayMethod,
  performanceRating: Performance,
) => {
  const count = await countGamesForPerformanceStats(prisma, {
    chipset: 'ALL',
    chipsetVariant: 'BASE' as ChipsetVariant,
    playMethod,
    performanceRating,
  });

  await upsertPerformanceStats(prisma, {
    chipset: 'ALL',
    chipsetVariant: 'BASE' as ChipsetVariant,
    playMethod,
    performanceRating,
    count,
  });
};

export const updateAllPerformanceStatsForGame = async (
  prisma: PrismaClient,
  gameId: string,
  chipset: Chipset,
  chipsetVariant: ChipsetVariant,
  playMethod: PlayMethod,
) => {
  const allPerformanceRatings: Performance[] = [
    'UNPLAYABLE',
    'BARELY_PLAYABLE',
    'PLAYABLE',
    'GOOD',
    'EXCELLENT',
    'VERY_GOOD',
  ];

  for (const performanceRating of allPerformanceRatings) {
    await updateSpecificPerformanceStats(
      prisma,
      chipset,
      chipsetVariant,
      playMethod,
      performanceRating,
    );

    await updateAggregatePerformanceStats(
      prisma,
      chipset,
      chipsetVariant,
      performanceRating,
    );

    await updateAllChipsetSpecificMethodStats(
      prisma,
      playMethod,
      performanceRating,
    );
  }
};
