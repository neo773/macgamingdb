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
