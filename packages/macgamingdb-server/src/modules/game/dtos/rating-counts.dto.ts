import { z } from 'zod';

export const RatingCountsSchema = z.object({
  ALL: z.number(),
  EXCELLENT: z.number(),
  VERY_GOOD: z.number(),
  GOOD: z.number(),
  PLAYABLE: z.number(),
  BARELY_PLAYABLE: z.number(),
  UNPLAYABLE: z.number(),
});
