'use client';

import { useState } from 'react';
import { type RouterOutputs } from '@/lib/trpc/provider';

type GameSearchResults = RouterOutputs['game']['search'];

export function useGameSearch() {
  const [searchResults, setSearchResults] = useState<GameSearchResults | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const isSearchMode = !!searchResults;

  const handleSearchResultsChange = (
    results: GameSearchResults | null,
    isLoading: boolean
  ) => {
    setSearchResults(results);
    setIsSearchLoading(isLoading);
  };

  const clearSearch = () => {
    setSearchResults(null);
    setIsSearchLoading(false);
  };

  return {
    searchResults,
    isSearchLoading,
    isSearchMode,
    handleSearchResultsChange,
    clearSearch,
  };
}
