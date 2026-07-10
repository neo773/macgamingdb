import { z } from 'zod';

export const LibraryStatusSchema = z.object({
  linked: z.boolean(),
  provider: z.string().optional(),
  externalUserId: z.string().optional(),
  lastSyncedAt: z.string().nullable().optional(),
});
