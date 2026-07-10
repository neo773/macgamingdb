import { z } from 'zod';

export const SitemapEntrySchema = z.object({
  slug: z.string().nullable(),
  id: z.string(),
  lastModified: z.string(),
});
