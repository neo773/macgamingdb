import { isNonEmptyString } from '@sniptt/guards';

export const slugifyGameName = (name: string): string => {
  const slug = name
    // Removed before NFKD because normalization expands them into letters (™ → "tm").
    .replace(/[™®©℠℗]/g, '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Purely numeric slugs would collide with Steam appIDs in the /games/{id} namespace.
  if (!isNonEmptyString(slug) || /^[0-9]+$/.test(slug)) {
    return '';
  }

  return slug;
};
