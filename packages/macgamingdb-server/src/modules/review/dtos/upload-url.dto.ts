import { z } from 'zod';

export const UploadUrlSchema = z.object({
  signedUrl: z.string(),
  publicUrl: z.string(),
  key: z.string(),
});
