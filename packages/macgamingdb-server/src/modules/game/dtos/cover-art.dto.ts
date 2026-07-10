import { z } from 'zod';

export const CoverArtSchema = z.object({
  headerImage: z.string(),
});
