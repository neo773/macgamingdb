'use client';

import { useRef, useEffect } from 'react';
import Script from 'next/script';
import { trpc } from '@/lib/trpc/provider';
import SearchBar from '@/modules/search/components/SearchBar';
import { type PerformanceFilter, type PlayMethodFilter } from '@/lib/constants';
import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '@macgamingdb/server/routers/_app';
import { homeJsonLd, faqJsonLd } from '@/lib/utils/jsonLd';
import { useHomeFilters, useGameSearch } from '@/modules/home/hooks';
import { HomeFilters, GameGrid } from '@/modules/home/components';

type RouterOutput = inferRouterOutputs<AppRouter>;

interface HomeClientProps {
  GamesPage: RouterOutput['game']['getGames'] & {
    ratingCounts: Record<string, number>;
  };
  PerformanceFilter: PerformanceFilter;
  ChipsetFilter: string;
  PlayMethodFilter: PlayMethodFilter;
}

export default function HomeClient({
  GamesPage,
  PerformanceFilter: performanceFilter,
  ChipsetFilter: chipsetFilter,
  PlayMethodFilter: playMethodFilter,
}: HomeClientProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    chipsetOptions,
    playMethodOptions,
    filterConfig,
    handleFilterChange,
    handleChipsetChange,
    handlePlayMethodChange,
    resetFilters,
  } = useHomeFilters({
    performanceFilter,
    chipsetFilter,
    playMethodFilter,
  });

  const {
    searchResults,
    isSearchLoading,
    isSearchMode,
    handleSearchResultsChange,
  } = useGameSearch();

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
      initialData: {
        pages: [GamesPage],
        pageParams: [undefined],
      },
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
          ratingCounts={GamesPage.ratingCounts}
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
