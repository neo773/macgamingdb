'use client';

import Script from 'next/script';
import { trpc } from '@/modules/trpc/trpc';
import { SearchBar } from '@/modules/search/components/SearchBar';
import { type RouterOutputs } from '@/modules/trpc/types/RouterOutputs';
import { homeJsonLd } from '@/modules/home/utils/homeJsonLd';
import { faqJsonLd } from '@/modules/home/utils/faqJsonLd';
import { useHomeFilters } from '@/modules/home/hooks/useHomeFilters';
import { useGameSearch } from '@/modules/home/hooks/useGameSearch';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { HomeFilters } from '@/modules/home/components/HomeFilters';
import { GameGrid } from '@/modules/home/components/GameGrid';

type GamesPage = RouterOutputs['game']['getGames'] & {
  ratingCounts: RouterOutputs['game']['getFilterCounts'];
};

type HomeClientProps = {
  GamesPage: GamesPage;
};

export const HomeClient = ({ GamesPage }: HomeClientProps) => {
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
    query,
    searchResults,
    isSearchLoading,
    isSearchMode,
    handleQueryChange,
  } = useGameSearch({ onClear: resetFilters });

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
    },
  );

  const filterCountsInput = {
    ...(filterConfig.chipset && { chipset: filterConfig.chipset }),
    ...(filterConfig.chipsetVariant && {
      chipsetVariant: filterConfig.chipsetVariant,
    }),
    ...(filterConfig.playMethod && { playMethod: filterConfig.playMethod }),
  };

  const { data: ratingCounts } = trpc.game.getFilterCounts.useQuery(
    filterCountsInput,
    {
      staleTime: 30000,
      initialData: isDefaultFilter ? GamesPage.ratingCounts : undefined,
    },
  );

  const loadMoreRef = useInfiniteScroll<HTMLDivElement>({
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    enabled: !isSearchMode,
  });

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
        <SearchBar
          value={query}
          onChange={handleQueryChange}
          isLoading={isSearchLoading}
        />
      </div>

      {!searchResults && (
        <HomeFilters
          chipsetFilter={chipsetFilter}
          playMethodFilter={playMethodFilter}
          performanceFilter={performanceFilter}
          chipsetGroups={chipsetGroups}
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
};
