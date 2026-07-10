import { z } from 'zod';
import { ContributorSchema } from './contributor.dto';

export const ContributorsPageSchema = z.object({
  contributors: z.array(ContributorSchema),
  nextCursor: z.number().nullable(),
  totalCount: z.number(),
});
