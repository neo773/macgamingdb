type GGDealsApiResponse = {
  success: boolean;
  data: {
    [steamId: string]: {
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
  };
};

export type GGDealsGamePrice = GGDealsApiResponse['data'][number];

export async function getGamePrices(
  steamAppId: string,
  region = 'us',
): Promise<GGDealsApiResponse['data'][number]> {
  const apiKey = process.env.GG_DEALS_API_KEY;
  if (!apiKey) {
    throw new Error('GG_DEALS_API_KEY is not configured');
  }

  const url = new URL('https://api.gg.deals/v1/prices/by-steam-app-id/');
  url.searchParams.set('ids', steamAppId);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('region', region);

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    console.error('gg.deals error body:', body);
    throw new Error(
      `gg.deals API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as GGDealsApiResponse;
  return data.data[steamAppId];
}
