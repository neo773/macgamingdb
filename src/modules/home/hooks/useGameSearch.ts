'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { isNonEmptyString } from '@sniptt/guards';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { trpc } from '@/modules/trpc/trpc';
import { type RouterOutputs } from '@/modules/trpc/types/RouterOutputs';
import { trackEvent } from '@/modules/analytics/utils/trackEvent';

type GameSearchResults = RouterOutputs['game']['search'];

interface UseGameSearchOptions {
  onClear?: () => void;
}

export const useGameSearch = ({ onClear }: UseGameSearchOptions = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery] = useDebounce(query, 300);

  const { data, isLoading } = trpc.game.search.useQuery(
    { query: debouncedQuery },
    {
      enabled: isNonEmptyString(debouncedQuery.trim()),
      placeholderData: (previousData) => previousData,
    },
  );

  const syncUrl = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 300);

  const trackSearch = useDebouncedCallback(() => {
    trackEvent({ name: 'search-performed' });
  }, 300);

  const handleQueryChange = (value: string) => {
    const wasActive = isNonEmptyString(query.trim());
    setQuery(value);
    syncUrl(value);

    if (isNonEmptyString(value.trim())) {
      trackSearch();
    } else if (wasActive) {
      onClear?.();
    }
  };

  const searchResults: GameSearchResults | null = !isNonEmptyString(
    debouncedQuery.trim(),
  )
    ? null
    : data || null;
  const isSearchMode = !!searchResults;

  return {
    query,
    searchResults,
    isSearchLoading: isLoading,
    isSearchMode,
    handleQueryChange,
  };
};
