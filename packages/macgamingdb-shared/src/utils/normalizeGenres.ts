import { GENRE_ALIASES } from '../constants/GENRE_ALIASES';
import { NON_GENRE_LABELS } from '../constants/NON_GENRE_LABELS';
import type { CanonicalGenre } from '../types/CanonicalGenre';

export const normalizeGenres = (rawGenres: string[]): CanonicalGenre[] => {
  const matched = rawGenres
    .map((rawGenre) => rawGenre.trim().toLowerCase())
    .filter((rawGenre) => rawGenre.length > 0)
    .filter((rawGenre) => !NON_GENRE_LABELS.includes(rawGenre))
    .map((rawGenre) => GENRE_ALIASES[rawGenre])
    .filter((genre): genre is CanonicalGenre => genre !== undefined);

  return [...new Set(matched)].sort();
};
