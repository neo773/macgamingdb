import { z } from 'zod';

export const ContributorSchema = z.object({
  id: z.string(),
  name: z.string(),
  joinedAt: z.string(),
  reviewCount: z.number(),
  uniqueGamesCount: z.number(),
  score: z.number(),
});
