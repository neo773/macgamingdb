import type { GameSearchProvider } from './GameSearchProvider';
import { steamGameSearchProvider } from './steam/steamGameSearchProvider';
import { igdbGameSearchProvider } from './igdb/igdbGameSearchProvider';

export const gameSearchProviders: GameSearchProvider[] = [
  steamGameSearchProvider,
  igdbGameSearchProvider,
];
