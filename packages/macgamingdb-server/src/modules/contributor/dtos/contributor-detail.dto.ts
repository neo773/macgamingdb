import { z } from 'zod';
import { ContributorReviewSchema } from './contributor-review.dto';

export const ContributorDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  joinedAt: z.string(),
  reviewCount: z.number(),
  uniqueGamesCount: z.number(),
  reviews: z.array(ContributorReviewSchema),
});
