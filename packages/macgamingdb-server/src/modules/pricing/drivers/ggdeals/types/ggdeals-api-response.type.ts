import type { GGDealsGamePrice } from './ggdeals-game-price.type';

export type GGDealsApiResponse = {
  success: boolean;
  data: Record<string, GGDealsGamePrice | null>;
};
