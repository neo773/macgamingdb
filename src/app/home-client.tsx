'use client';

import { useRef, useEffect } from 'react';
import Script from 'next/script';
import { trpc } from '@/lib/trpc/provider';
import SearchBar from '@/modules/search/components/SearchBar';
import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '@macgamingdb/server/routers/_app';
import { homeJsonLd, faqJsonLd } from '@/lib/utils/jsonLd';
import { useHomeFilters, useGameSearch } from '@/modules/home/hooks';
import { HomeFilters, GameGrid } from '@/modules/home/components';

type RouterOutput = inferRouterOutputs<AppRouter>;

type GamesPage = RouterOutput['game']['getGames'] & {
  ratingCounts: RouterOutput['game']['getFilterCounts'];
};

interface HomeClientProps {
  GamesPage: GamesPage;
}

export default function HomeClient({ GamesPage }: HomeClientProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    performanceFilter,
    chipsetFilter,
    playMethodFilter,
    isDefaultFilter,
    chipsetOptions,
    playMethodOptions,
    filterConfig,
    handleFilterChange,
    handleChipsetChange,
    handlePlayMethodChange,
    resetFilters,
  } = useHomeFilters();

  const {
    searchResults,
    isSearchLoading,
    isSearchMode,
    handleSearchResultsChange,
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

  const handleSearchChange = (
    results: Parameters<typeof handleSearchResultsChange>[0],
    isLoading: boolean
  ) => {
    handleSearchResultsChange(results, isLoading);

    if (results === null && searchResults !== null) {
      resetFilters();
    }
  };

  const allFilteredGames = gamesData?.pages.flatMap((page) => page.games) || [];

  return (
    <>
      <Script
        type="application/ld+json"
        id="jsonLdHome"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Script
        type="application/ld+json"
        id="jsonLdFaq"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="flex justify-center md:px-8 md:p-0 mb-8">
        <SearchBar onResultsChange={handleSearchChange} />
      </div>

      {!searchResults && (
        <HomeFilters
          chipsetFilter={chipsetFilter}
          playMethodFilter={playMethodFilter}
          performanceFilter={performanceFilter}
          chipsetOptions={chipsetOptions}
          playMethodOptions={playMethodOptions}
          ratingCounts={isDefaultFilter ? GamesPage.ratingCounts : ratingCounts}
          onChipsetChange={handleChipsetChange}
          onPlayMethodChange={handlePlayMethodChange}
          onPerformanceChange={handleFilterChange}
        />
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
