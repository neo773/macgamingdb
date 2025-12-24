import { type z } from 'zod';
import {
  type PerformanceEnum,
  type ChipsetEnum,
  type ChipsetVariantEnum,
  type PlayMethod,
  type PlayMethodEnum,
} from '@macgamingdb/server/schema';

export enum SearchURLParamsKeys {
  CHIPSET = 'chipset',
  PERFORMANCE = 'performance',
  PLAY_METHOD = 'playMethod',
}

export type PerformanceFilter = 'ALL' | z.infer<typeof PerformanceEnum>;
export type PlayMethodFilter = 'ALL' | z.infer<typeof PlayMethodEnum>;

export interface FilterConfig {
  limit: number;
  performance: PerformanceFilter;
  chipset?: z.infer<typeof ChipsetEnum>;
  chipsetVariant?: z.infer<typeof ChipsetVariantEnum>;
  playMethod?: PlayMethod;
}

export function createFilterConfig(
  performanceParam: string | null | undefined,
  chipsetParam: string | null | undefined,
  playMethodParam: string | null | undefined,
): FilterConfig {
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
}
