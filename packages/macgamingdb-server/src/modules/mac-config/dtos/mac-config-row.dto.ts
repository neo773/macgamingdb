import { z } from 'zod';

export const MacConfigRowSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  metadata: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
