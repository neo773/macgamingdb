'use client';

import { useState } from 'react';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { usePathname, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/provider';
import { trackEvent } from '@/lib/analytics/umami';

const SEARCH_PARAM = 'q';

export function useGameSearch() {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get(SEARCH_PARAM) ?? '';
  });
  const [debouncedQuery] = useDebounce(query, 300);
  const isSearchMode = debouncedQuery.trim().length > 0;

  const { data, isLoading } = trpc.game.search.useQuery(
    { query: debouncedQuery },
    { enabled: isSearchMode, placeholderData: (prev) => prev },
  );

  const onDebouncedChange = useDebouncedCallback((next: string) => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (next) {
      params.set(SEARCH_PARAM, next);
    } else {
      params.delete(SEARCH_PARAM);
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });

    if (next.trim()) trackEvent({ name: 'search-performed' });
  }, 300);

  return {
    query,
    setQuery: (next: string) => {
      setQuery(next);
      onDebouncedChange(next);
    },
    searchResults: isSearchMode ? (data ?? null) : null,
    isSearchLoading: isSearchMode && isLoading,
    isSearchMode,
  };
}
