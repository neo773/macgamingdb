import { Injectable } from '@nestjs/common';
import { PricingException } from '../../../exceptions/pricing.exception';
import { GG_DEALS_PRICES_ENDPOINT } from '../constants/gg-deals-prices-endpoint.constant';
import { GG_DEALS_DEFAULT_REGION } from '../constants/gg-deals-default-region.constant';
import type { GGDealsApiResponse } from '../types/ggdeals-api-response.type';
import type { GGDealsGamePrice } from '../types/ggdeals-game-price.type';
import { resolveGgDealsRegion } from '../utils/resolve-gg-deals-region.util';

@Injectable()
export class GgDealsApiClientService {
  async getGamePrices({
    steamAppId,
    country = GG_DEALS_DEFAULT_REGION,
  }: {
    steamAppId: string;
    country?: string;
  }): Promise<GGDealsGamePrice | null> {
    const apiKey = process.env.GG_DEALS_API_KEY;
    if (!apiKey) {
      throw new PricingException(
        'GG_DEALS_API_KEY is not configured',
        'PRICING_MISCONFIGURED',
      );
    }

    const region = resolveGgDealsRegion({ country });

    const url = new URL(GG_DEALS_PRICES_ENDPOINT);
    url.searchParams.set('ids', steamAppId);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('region', region);

    const response = await fetch(url);
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(
        `gg.deals API error: ${response.status} ${response.statusText}`,
        body,
      );
      throw new PricingException(
        `gg.deals API error: ${response.status} ${response.statusText}`,
        'PRICING_REQUEST_FAILED',
      );
    }

    const { data }: GGDealsApiResponse = await response.json();
    return data[steamAppId] ?? null;
  }
}
