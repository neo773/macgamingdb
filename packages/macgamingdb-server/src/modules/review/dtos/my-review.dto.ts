import { z } from 'zod';
import { GameReviewWithMacConfigSchema } from './game-review-with-mac-config.dto';

export const MyReviewSchema = GameReviewWithMacConfigSchema.extend({
  gameName: z.string().nullable(),
  gameSlug: z.string().nullable(),
  gameHeaderImage: z.string().nullable(),
});
