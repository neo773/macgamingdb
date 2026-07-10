import type { GameSearchResult } from '../types/game-search-result.type';
import type { NormalizedGameDetails } from '../types/normalized-game-details.type';

export interface GameSourceDriver {
  search(params: { query: string; limit: number }): Promise<GameSearchResult[]>;
  fetchGame(params: {
    externalId: string;
  }): Promise<NormalizedGameDetails | null>;
}
