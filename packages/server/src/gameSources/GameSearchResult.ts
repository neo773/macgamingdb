import type { z } from 'zod';
import type { GameSearchResultSchema } from '../schema/openapi';

export type GameSearchResult = z.infer<typeof GameSearchResultSchema>;
