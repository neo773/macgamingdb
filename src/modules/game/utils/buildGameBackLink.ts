import { isNonEmptyString } from '@sniptt/guards';
import { SearchURLParamsKeys } from '@/modules/search/constants/SearchURLParamsKeys';
import { buildSearchQueryString } from '@/modules/search/utils/buildSearchQueryString';
import { type GameBackLink } from '../types/GameBackLink';

export const buildGameBackLink = ({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | URLSearchParams;
}): GameBackLink => {
  const queryString = buildSearchQueryString({ searchParams });

  if (!isNonEmptyString(queryString)) {
    return { href: '/', label: 'Home' };
  }

  const params = new URLSearchParams(queryString);
  const hasQuery = isNonEmptyString(
    params.get(SearchURLParamsKeys.QUERY) ?? '',
  );

  if (hasQuery) {
    return {
      href: `/?${queryString}`,
      label: 'Back to search results',
    };
  }

  return {
    href: `/?${queryString}`,
    label: 'Back to games',
  };
};
