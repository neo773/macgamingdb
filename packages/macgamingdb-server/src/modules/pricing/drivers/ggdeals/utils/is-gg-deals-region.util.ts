import { GG_DEALS_SUPPORTED_REGIONS } from '../constants/gg-deals-supported-regions.constant';
import type { GgDealsRegion } from '../types/ggdeals-region.type';

export const isGgDealsRegion = (value: string): value is GgDealsRegion =>
  GG_DEALS_SUPPORTED_REGIONS.some((region) => region === value);
