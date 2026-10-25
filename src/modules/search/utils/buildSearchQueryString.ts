import { isNonEmptyString } from '@sniptt/guards';
import { SearchURLParamsKeys } from '@/modules/search/constants/SearchURLParamsKeys';

type SearchParamsInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | undefined;

const ALLOWED_SEARCH_KEYS = new Set<string>([
  SearchURLParamsKeys.QUERY,
  SearchURLParamsKeys.CHIPSET,
  SearchURLParamsKeys.PERFORMANCE,
  SearchURLParamsKeys.PLAY_METHOD,
  SearchURLParamsKeys.GENRE,
]);

export const buildSearchQueryString = ({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}): string => {
  if (!searchParams) {
    return '';
  }

  const result = new URLSearchParams();

  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((value, key) => {
      if (ALLOWED_SEARCH_KEYS.has(key) && isNonEmptyString(value.trim())) {
        result.append(key, value.trim());
      }
    });

    return result.toString();
  }

  for (const [key, value] of Object.entries(searchParams)) {
    if (!ALLOWED_SEARCH_KEYS.has(key) || !value) {
      continue;
    }

    if (typeof value === 'string') {
      if (isNonEmptyString(value.trim())) {
        result.set(key, value.trim());
      }
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (isNonEmptyString(item.trim())) {
          result.append(key, item.trim());
        }
      }
    }
  }

  return result.toString();
};
