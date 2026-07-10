import { z } from 'zod';
import { PerformanceEnum } from '../../../schema';

export const GameListItemSchema = z.object({
  id: z.string(),
  slug: z.string().nullable(),
  name: z.string().nullable(),
  headerImage: z.string().nullable(),
  releaseYear: z.number().nullable(),
  performanceRating: PerformanceEnum,
});
