import { z } from 'zod';

export const OkResultSchema = z.object({
  ok: z.boolean(),
});
