import type { GameSource } from './GameSource';
import type { GameSourceProvider } from './GameSourceProvider';
import { steamGameSourceProvider } from './steam/steamGameSourceProvider';
import { igdbGameSourceProvider } from './igdb/igdbGameSourceProvider';

export const gameSourceProviders: Record<GameSource, GameSourceProvider> = {
  steam: steamGameSourceProvider,
  igdb: igdbGameSourceProvider,
};
