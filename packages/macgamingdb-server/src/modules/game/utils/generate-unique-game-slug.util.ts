import { slugifyGameName } from './slugify-game-name.util';

type GenerateUniqueGameSlugParams = {
  name: string;
  releaseYear?: number;
  fallbackId: string;
  isTaken: (slug: string) => Promise<boolean>;
};

export const generateUniqueGameSlug = async ({
  name,
  releaseYear,
  fallbackId,
  isTaken,
}: GenerateUniqueGameSlugParams): Promise<string> => {
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
};
