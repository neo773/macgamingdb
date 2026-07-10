import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from 'macgamingdb-shared/utils/isDefined';

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

  if (isNonEmptyString(base)) {
    candidates.push(base);
    if (isDefined(releaseYear)) {
      candidates.push(`${base}-${releaseYear}`);
    }
    candidates.push(`${base}-${fallbackId}`);
  }

  candidates.push(`game-${fallbackId}`);

  for (const candidate of candidates) {
    if (!isNonEmptyString(candidate) || /^[0-9]+$/.test(candidate)) {
      continue;
    }
    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }

  return `game-${fallbackId}`;
};
