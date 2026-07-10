import { z } from 'zod';
import { PerformanceEnum } from '../../../schema';

export const LibraryEntrySchema = z.object({
  externalGameId: z.string(),
  name: z.string().nullable(),
  iconHash: z.string().nullable(),
  playtimeMinutes: z.number(),
  aggregatedPerformance: PerformanceEnum.nullable(),
  reviewCount: z.number(),
  hasData: z.boolean(),
});
