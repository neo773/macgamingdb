'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { trpc } from '@/modules/trpc/trpc';
import { type RouterOutputs } from '@/modules/trpc/types/RouterOutputs';
import { trackEvent } from '@/modules/analytics/utils/trackEvent';

type GameSearchResults = RouterOutputs['game']['search'];

interface UseGameSearchOptions {
  onClear?: () => void;
}

export function useGameSearch({ onClear }: UseGameSearchOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery] = useDebounce(query, 300);

  const { data, isLoading } = trpc.game.search.useQuery(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.trim().length > 0,
      placeholderData: (prev) => prev,
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
    const wasActive = query.trim().length > 0;
    setQuery(value);
    syncUrl(value);

    if (value.trim().length > 0) {
      trackSearch();
    } else if (wasActive) {
      onClear?.();
    }
  };

  const searchResults: GameSearchResults | null =
    debouncedQuery.trim() === '' ? null : data || null;
  const isSearchMode = !!searchResults;

  return {
    query,
    searchResults,
    isSearchLoading: isLoading,
    isSearchMode,
    handleQueryChange,
  };
}
