import { z } from 'zod';

export const MutationResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
