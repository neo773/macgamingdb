import { z } from 'zod';

export const LibraryLinkUrlSchema = z.object({
  url: z.string(),
});
