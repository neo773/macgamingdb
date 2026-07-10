import { z } from 'zod';
import { GAME_SOURCES } from '../constants/game-sources.constant';

export const GameSearchResultSchema = z.object({
  ref: z.string(),
  source: z.enum(GAME_SOURCES),
  name: z.string(),
  slug: z.string().nullable(),
  coverImage: z.string().nullable(),
  releaseYear: z.number().nullable(),
});
