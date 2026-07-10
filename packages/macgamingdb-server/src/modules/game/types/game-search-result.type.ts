import type { z } from 'zod';
import type { GameSearchResultSchema } from '../dtos/game-search-result.dto';

export type GameSearchResult = z.infer<typeof GameSearchResultSchema>;
