import { GG_DEALS_DEFAULT_REGION } from '../constants/gg-deals-default-region.constant';
import type { GgDealsRegion } from '../types/ggdeals-region.type';
import { isGgDealsRegion } from './is-gg-deals-region.util';

export const resolveGgDealsRegion = ({
  country,
}: {
  country: string;
}): GgDealsRegion =>
  isGgDealsRegion(country) ? country : GG_DEALS_DEFAULT_REGION;
