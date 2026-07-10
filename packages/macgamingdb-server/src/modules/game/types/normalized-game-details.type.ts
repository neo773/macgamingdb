import type { GameSource } from './game-source.type';

export type NormalizedGameDetails = {
  name: string;
  headerImage: string | null;
  descriptionHtml: string | null;
  developers: string[];
  publishers: string[];
  website: string | null;
  releaseDate: string | null;
  releaseYear: number | null;
  genres: string[];
  screenshots: string[];
  externalIds: Partial<Record<GameSource, string>>;
};
