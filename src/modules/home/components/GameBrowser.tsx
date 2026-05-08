'use client';

import { useRef, useEffect } from 'react';
import Script from 'next/script';
import { trpc } from '@/lib/trpc/provider';
import SearchBar from '@/modules/search/components/SearchBar';
import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '@macgamingdb/server/routers/_app';
import { homeJsonLd, faqJsonLd } from '@/lib/utils/jsonLd';
import { useHomeFilters, useGameSearch } from '@/modules/home/hooks';
import { GameGrid } from '@/modules/home/components';
import { ChipsetFilter } from '@/modules/search/components/filters/ChipsetFilter';
import { PlayMethodFilter } from '@/modules/search/components/filters/PlayMethodFilter';
import { PerformanceFilter } from '@/modules/search/components/filters/PerformanceFilter';
import { formatRatingLabel } from '@macgamingdb/server/utils/formatRatingLabel';

type RouterOutput = inferRouterOutputs<AppRouter>;

type GamesPage = RouterOutput['game']['getGames'] & {
  ratingCounts: RouterOutput['game']['getFilterCounts'];
};

interface GameBrowserProps {
  GamesPage: GamesPage;
}

export default function GameBrowser({ GamesPage }: GameBrowserProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    performanceFilter,
    chipsetFilter,
    playMethodFilter,
    isDefaultFilter,
    chipsetGroups,
    playMethodOptions,
    filterConfig,
    handleFilterChange,
    handleChipsetChange,
    handlePlayMethodChange,
    resetFilters,
  } = useHomeFilters();

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    searchResults,
    isSearchLoading,
    isSearchMode,
  } = useGameSearch();

  const initialGamesData = isDefaultFilter
    ? { pages: [GamesPage], pageParams: [undefined] }
    : undefined;

  const {
    data: gamesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isGamesLoading,
  } = trpc.game.getGames.useInfiniteQuery(
    { ...filterConfig },
    {
      getNextPageParam: (lastPage) => lastPage.nextOffset,
      enabled: !isSearchMode,
      staleTime: 30000,
      initialData: initialGamesData,
    }
  );

  const filterCountsInput = {
    ...(filterConfig.chipset && { chipset: filterConfig.chipset }),
    ...(filterConfig.chipsetVariant && { chipsetVariant: filterConfig.chipsetVariant }),
    ...(filterConfig.playMethod && { playMethod: filterConfig.playMethod }),
  };

  const { data: ratingCounts } = trpc.game.getFilterCounts.useQuery(
    filterCountsInput,
    {
      staleTime: 30000,
      initialData: isDefaultFilter ? GamesPage.ratingCounts : undefined,
    }
  );

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isSearchMode || isFetchingNextPage)
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, isSearchMode]);

  const handleSearchInput = (next: string) => {
    setSearchQuery(next);
    if (next.trim().length === 0 && searchResults !== null) {
      resetFilters();
    }
  };

  const allFilteredGames = gamesData?.pages.flatMap((page) => page.games) || [];

  return (
    <>
      <Script
        type="application/ld+json"
        id="jsonLdHome"
        // eslint-disable-next-line react/no-danger -- ld+json structured data requires raw HTML injection
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Script
        type="application/ld+json"
        id="jsonLdFaq"
        // eslint-disable-next-line react/no-danger -- ld+json structured data requires raw HTML injection
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="flex justify-center md:px-8 md:p-0 mb-8">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchInput}
          isLoading={isSearchLoading}
        />
      </div>

      {!searchResults && (
        <div className="mb-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              <ChipsetFilter
                selectedChipset={chipsetFilter}
                chipsetGroups={chipsetGroups}
                onChipsetChange={handleChipsetChange}
              />
              <PlayMethodFilter
                selectedPlayMethod={playMethodFilter}
                playMethodOptions={playMethodOptions}
                onPlayMethodChange={handlePlayMethodChange}
              />
              <PerformanceFilter
                activeFilter={performanceFilter}
                onFilterChange={handleFilterChange}
                displayStats={
                  isDefaultFilter ? GamesPage.ratingCounts : ratingCounts
                }
                formatRatingLabel={formatRatingLabel}
              />
            </div>
          </div>
        </div>
      )}

      <GameGrid
        isLoading={isSearchLoading || (isGamesLoading && !isSearchMode)}
        searchResults={searchResults}
        games={allFilteredGames}
        isFetchingNextPage={isFetchingNextPage}
      />

      {!isSearchMode && hasNextPage && (
        <div
          ref={loadMoreRef}
          className="w-full h-20 flex items-center justify-center mt-8"
        ></div>
      )}
    </>
  );
}
