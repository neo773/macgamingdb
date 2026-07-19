import { z } from 'zod';

export const ReportResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
