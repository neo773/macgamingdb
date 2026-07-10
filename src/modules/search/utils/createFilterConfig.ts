import { type z } from 'zod';
import {
  type ChipsetEnum,
  type ChipsetVariantEnum,
} from 'macgamingdb-server/schema';
import { type FilterConfig } from '@/modules/search/types/FilterConfig';
import { type PerformanceFilter } from '@/modules/search/types/PerformanceFilter';
import { type PlayMethodFilter } from '@/modules/search/types/PlayMethodFilter';

export const createFilterConfig = (
  performanceParam: string | null | undefined,
  chipsetParam: string | null | undefined,
  playMethodParam: string | null | undefined,
): FilterConfig => {
  const filter = (performanceParam || 'ALL') as PerformanceFilter;
  const chipset = chipsetParam || 'all';
  const playMethod = (playMethodParam || 'ALL') as PlayMethodFilter;

  const config: FilterConfig = {
    limit: 6,
    performance: filter,
  };

  if (chipset !== 'all') {
    const [chipsetValue, variantValue] = chipset.split('-') as [
      z.infer<typeof ChipsetEnum>,
      z.infer<typeof ChipsetVariantEnum>,
    ];
    config.chipset = chipsetValue;
    config.chipsetVariant = variantValue;
  }

  if (playMethod !== 'ALL') {
    config.playMethod = playMethod;
  }

  return config;
};
