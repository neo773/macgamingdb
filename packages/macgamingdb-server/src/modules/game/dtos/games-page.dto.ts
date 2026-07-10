import { z } from 'zod';
import { GameListItemSchema } from './game-list-item.dto';

export const GamesPageSchema = z.object({
  games: z.array(GameListItemSchema),
  hasNextPage: z.boolean(),
  nextOffset: z.number().optional(),
});
