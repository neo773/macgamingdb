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

export const DEFAULT_PERFORMANCE_FILTER: PerformanceFilter = 'ALL';
export const DEFAULT_CHIPSET_FILTER = 'all';
export const DEFAULT_PLAY_METHOD_FILTER: PlayMethodFilter = 'ALL';

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
  const filter = (performanceParam || DEFAULT_PERFORMANCE_FILTER) as PerformanceFilter;
  const chipset = chipsetParam || DEFAULT_CHIPSET_FILTER;
  const playMethod = (playMethodParam || DEFAULT_PLAY_METHOD_FILTER) as PlayMethodFilter;

  const config: FilterConfig = {
    limit: 6,
    performance: filter,
  };

  if (chipset !== DEFAULT_CHIPSET_FILTER) {
    const [chipsetValue, variantValue] = chipset.split('-') as [
      z.infer<typeof ChipsetEnum>,
      z.infer<typeof ChipsetVariantEnum>,
    ];
    config.chipset = chipsetValue;
    config.chipsetVariant = variantValue;
  }

  if (playMethod !== DEFAULT_PLAY_METHOD_FILTER) {
    config.playMethod = playMethod;
  }

  return config;
}
