import { slugifyGameName } from './slugifyGameName';

export interface GenerateUniqueGameSlugOptions {
  releaseYear?: number;
  fallbackId: string;
  isTaken: (slug: string) => Promise<boolean>;
}

export async function generateUniqueGameSlug(
  name: string,
  options: GenerateUniqueGameSlugOptions,
): Promise<string> {
  const { releaseYear, fallbackId, isTaken } = options;
  const base = slugifyGameName(name);

  const candidates: string[] = [];

  if (base !== '') {
    candidates.push(base);
    if (releaseYear !== undefined) {
      candidates.push(`${base}-${releaseYear}`);
    }
    candidates.push(`${base}-${fallbackId}`);
  }

  candidates.push(`game-${fallbackId}`);

  for (const candidate of candidates) {
    if (candidate === '' || /^[0-9]+$/.test(candidate)) {
      continue;
    }
    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }

  return `game-${fallbackId}`;
}
