import { CANONICAL_GENRES } from '../constants/CANONICAL_GENRES';
import type { CanonicalGenre } from '../types/CanonicalGenre';

export const isCanonicalGenre = (value: string): value is CanonicalGenre =>
  CANONICAL_GENRES.some((genre) => genre === value);
