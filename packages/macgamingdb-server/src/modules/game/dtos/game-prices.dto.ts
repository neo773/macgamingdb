import { z } from 'zod';

export const GamePricesSchema = z
  .object({
    title: z.string(),
    url: z.string(),
    prices: z.object({
      currentRetail: z.string(),
      currentKeyshops: z.string(),
      historicalRetail: z.string(),
      historicalKeyshops: z.string(),
      currency: z.string(),
    }),
  })
  .nullable();
