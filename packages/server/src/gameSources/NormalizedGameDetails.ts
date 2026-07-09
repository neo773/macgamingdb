import type { GameSource } from './GameSource';

export interface NormalizedGameDetails {
  source: GameSource;
  name: string;
  headerImage: string | null;
  descriptionHtml: string | null;
  developers: string[];
  publishers: string[];
  website: string | null;
  steamAppId: string | null;
  releaseDate: string | null;
  releaseYear: number | null;
  genres: string[];
  screenshots: string[];
}
