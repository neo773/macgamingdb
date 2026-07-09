import type { GameSource } from './GameSource';
import type { GameSearchResult } from './GameSearchResult';

export interface GameSearchProvider {
  readonly source: GameSource;
  search(query: string, limit: number): Promise<GameSearchResult[]>;
}
