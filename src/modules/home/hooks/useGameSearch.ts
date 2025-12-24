'use client';

import { useState } from 'react';
import { type SteamGameSearchObject } from '@macgamingdb/server/api/steam';

export function useGameSearch() {
  const [searchResults, setSearchResults] = useState<SteamGameSearchObject[] | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const isSearchMode = !!searchResults;

  const handleSearchResultsChange = (
    results: SteamGameSearchObject[] | null,
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
