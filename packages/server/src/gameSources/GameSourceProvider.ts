import type { GameSource } from './GameSource';
import type { GameSearchResult } from './GameSearchResult';
import type { NormalizedGameDetails } from './NormalizedGameDetails';

export interface GameSourceProvider {
  readonly source: GameSource;
  search(query: string, limit: number): Promise<GameSearchResult[]>;
  fetchGame(externalId: string): Promise<NormalizedGameDetails | null>;
}
