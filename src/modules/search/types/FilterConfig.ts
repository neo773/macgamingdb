import { type z } from 'zod';
import {
  type ChipsetEnum,
  type ChipsetVariantEnum,
  type PlayMethod,
} from 'macgamingdb-server/schema';
import { type PerformanceFilter } from '@/modules/search/types/PerformanceFilter';

export type FilterConfig = {
  limit: number;
  performance: PerformanceFilter;
  chipset?: z.infer<typeof ChipsetEnum>;
  chipsetVariant?: z.infer<typeof ChipsetVariantEnum>;
  playMethod?: PlayMethod;
};
