export type GGDealsGamePrice = {
  title: string;
  url: string;
  prices: {
    currentRetail: string;
    currentKeyshops: string;
    historicalRetail: string;
    historicalKeyshops: string;
    currency: string;
  };
};

type GGDealsApiResponse = {
  success: boolean;
  data: Record<string, GGDealsGamePrice | null>;
};

type Region = (typeof SUPPORTED_REGIONS)[number];

const GG_DEALS_PRICES_ENDPOINT =
  'https://api.gg.deals/v1/prices/by-steam-app-id/';

const SUPPORTED_REGIONS = [
  'au',
  'be',
  'br',
  'ca',
  'ch',
  'de',
  'dk',
  'es',
  'eu',
  'fi',
  'fr',
  'gb',
  'ie',
  'it',
  'nl',
  'no',
  'pl',
  'se',
  'us',
] as const;

const DEFAULT_REGION: Region = 'us';

export async function getGamePrices(
  steamAppId: string,
  country: string = DEFAULT_REGION,
): Promise<GGDealsGamePrice | null> {
  const apiKey = process.env.GG_DEALS_API_KEY;
  if (!apiKey) {
    throw new Error('GG_DEALS_API_KEY is not configured');
  }

  const region = (SUPPORTED_REGIONS as readonly string[]).includes(country)
    ? (country as Region)
    : DEFAULT_REGION;

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
    throw new Error(
      `gg.deals API error: ${response.status} ${response.statusText}`,
    );
  }

  const { data } = (await response.json()) as GGDealsApiResponse;
  return data[steamAppId] ?? null;
}
