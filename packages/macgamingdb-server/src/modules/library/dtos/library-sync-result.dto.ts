import { z } from 'zod';

export const LibrarySyncResultSchema = z.object({
  count: z.number(),
  syncedAt: z.string(),
});
