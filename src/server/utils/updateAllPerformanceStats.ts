import type { PrismaClient } from '@/generated/prisma/client';
import { updateAllPerformanceStatsForGame } from '../helpers/performance-stats';
import type { Chipset, ChipsetVariant, PlayMethod } from '../schema';
import { updateGameAggregatedPerformance } from './updateGameAggregatedPerformance';


export const updateAllPerformanceStats = async (
  prisma: PrismaClient,
  gameId: string,
  chipset: Chipset,
  chipsetVariant: ChipsetVariant,
  playMethod: PlayMethod
) => {
  await updateGameAggregatedPerformance(prisma, gameId);

  await updateAllPerformanceStatsForGame(
    prisma,
    gameId,
    chipset,
    chipsetVariant,
    playMethod
  );
};
