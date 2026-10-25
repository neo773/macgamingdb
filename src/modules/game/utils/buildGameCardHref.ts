import { isNonEmptyString } from '@sniptt/guards';
import { buildSearchQueryString } from '@/modules/search/utils/buildSearchQueryString';

type BuildGameCardHrefParams = {
  identifier: string;
  searchParams?:
    | URLSearchParams
    | Record<string, string | string[] | undefined>;
};

export const buildGameCardHref = ({
  identifier,
  searchParams,
}: BuildGameCardHrefParams): string => {
  const queryString = buildSearchQueryString({ searchParams });

  if (isNonEmptyString(queryString)) {
    return `/games/${identifier}?${queryString}`;
  }

  return `/games/${identifier}`;
};
