'use client';

import { useState, useRef, useEffect } from 'react';
import * as React from 'react';
import { type SteamGameSearchObject } from '@/server/helpers/steam';
import { trpc } from '@/lib/trpc/provider';
import SearchBar from '@/components/search/SearchBar';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  SearchURLParamsKeys,
  type PerformanceFilter,
  createFilterConfig,
  type PlayMethodFilter,
} from '@/lib/constants';
import { GameCard } from '@/components/game/Card';
import { GameCardSkeleton } from '@/components/game/SekeletonCard';
import { ChipsetFilter as ChipsetFilterComponent } from '@/components/search/filters/ChipsetFilter';
import { PlayMethodFilter as PlayMethodFilterComponent } from '@/components/search/filters/PlayMethodFilter';
import { PerformanceFilter as PerformanceFilterComponent } from '@/components/search/filters/PerformanceFilter';
import { formatRatingLabel } from '@/server/utils/formatRatingLabel';
import { getChipsetCombinations } from '@/server/utils/getChipsetCombinations';
import { PlayMethodEnum } from '@/server/schema';
import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '@/server/routers/_app';
import Script from 'next/script';

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
  GamesPage: GamesPage,
  PerformanceFilter: PerformanceFilter,
  ChipsetFilter: ChipsetFilter,
  PlayMethodFilter: PlayMethodFilter,
}: HomeClientProps) {
  // Router and URL params
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchResults, setSearchResults] = useState<
    SteamGameSearchObject[] | null
  >(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const chipsetOptions = [
    { value: 'all', label: 'All Chipsets' },
    ...getChipsetCombinations(),
  ];

  const playMethodOptions = [
    { value: 'ALL', label: 'All Methods' },
    ...PlayMethodEnum.options.map((method) => ({
      value: method,
      label: method,
    })),
  ];

  // Get the current filter configuration for queries
  const filterConfig = React.useMemo(() => {
    return createFilterConfig(
      PerformanceFilter,
      ChipsetFilter,
      PlayMethodFilter,
    );
  }, [PerformanceFilter, ChipsetFilter, PlayMethodFilter]);

  // Track if we're in search mode
  const isSearchMode = !!searchResults;

  // Get filtered games - always enabled when not searching
  const {
    data: gamesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isGamesLoading,
  } = trpc.game.getGames.useInfiniteQuery(
    {
      ...filterConfig,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextOffset,
      enabled: !isSearchMode, // Always fetch when not searching
      staleTime: 30000, // Cache for 30 seconds
      initialData: {
        pages: [GamesPage],
        pageParams: [undefined],
      },
    },
  );

  // Update URL when filters change
  const updateFilters = (
    performance: PerformanceFilter,
    chipset: string,
    playMethod: PlayMethodFilter,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (performance !== 'ALL') {
      params.set(SearchURLParamsKeys.PERFORMANCE, performance);
    } else {
      params.delete(SearchURLParamsKeys.PERFORMANCE);
    }

    if (chipset !== 'all') {
      params.set(SearchURLParamsKeys.CHIPSET, chipset);
    } else {
      params.delete(SearchURLParamsKeys.CHIPSET);
    }

    if (playMethod !== 'ALL') {
      params.set(SearchURLParamsKeys.PLAY_METHOD, playMethod);
    } else {
      params.delete(SearchURLParamsKeys.PLAY_METHOD);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle performance filter change
  const handleFilterChange = (filter: PerformanceFilter) => {
    updateFilters(filter, ChipsetFilter, PlayMethodFilter);
  };

  // Handle chipset change
  const handleChipsetChange = (value: string) => {
    updateFilters(PerformanceFilter, value, PlayMethodFilter);
  };

  // Handle play method change
  const handlePlayMethodChange = (value: string) => {
    updateFilters(PerformanceFilter, ChipsetFilter, value as PlayMethodFilter);
  };

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (
      !loadMoreRef.current ||
      !hasNextPage ||
      isSearchMode ||
      isFetchingNextPage
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, isSearchMode]);

  // Handle search results
  const handleSearchResultsChange = (
    results: SteamGameSearchObject[] | null,
    isLoading: boolean,
  ) => {
    setSearchResults(results);
    setIsSearchLoading(isLoading);

    if (results === null && searchResults !== null) {
      // Clear search results, reset URL to default
      updateFilters('ALL', 'all', 'ALL');
    }
  };

  // Get games to display (either search results or filtered games)
  const getGamesToDisplay = () => {
    // Show loading skeleton while loading
    if (isSearchLoading || (isGamesLoading && !isSearchMode)) {
      return Array(6)
        .fill(null)
        .map((_, i) => <GameCardSkeleton key={`skeleton-${i}`} />);
    }

    // Show search results if available
    if (searchResults) {
      if (searchResults.length === 0) {
        return (
          <div className="col-span-full text-center py-8">
            <p className="text-xl text-gray-400">
              No games found matching your search.
            </p>
          </div>
        );
      }

      return searchResults.map((game) => (
        <GameCard key={game.objectID} game={game} />
      ));
    }

    // Show filtered games from our database
    const allFilteredGames =
      gamesData?.pages.flatMap((page) => page.games) || [];

    if (allFilteredGames.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-xl text-gray-400">
            No games found with the selected filters.
          </p>
        </div>
      );
    }

    return (
      <>
        {allFilteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={{
              objectID: game.id,
              name: game.details ? JSON.parse(game.details).name : 'Unknown',
              url: '',
              performanceRating: game.performanceRating,
            }}
          />
        ))}

        {isFetchingNextPage &&
          Array(6)
            .fill(null)
            .map((_, i) => <GameCardSkeleton key={`loading-more-${i}`} />)}
      </>
    );
  };

  const jsonLdHome = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MacGamingDB',
    url: 'https://macgamingdb.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://macgamingdb.app/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I run Windows games on Mac?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Yes. Many Windows games run on macOS using compatibility layers such as Rosetta 2, CrossOver, Parallels, or Apple's Game Porting Toolkit. MacGamingDB tracks performance for each method.",
        },
      },
      {
        '@type': 'Question',
        name: 'Do M1, M2, M3 and M4 Macs run games better?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Apple Silicon Macs (M1–M4) deliver strong performance in many games. Compatibility varies, so MacGamingDB provides FPS benchmarks and user reports by chip generation.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I find a list of Mac compatible games?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MacGamingDB is a searchable, community-driven database of Mac compatible games. It includes benchmarks, compatibility methods, and user reviews.',
        },
      },
    ],
  };

  return (
    <>
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHome) }}
      />
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <div className="flex justify-center md:px-8 md:p-0 mb-8">
        <SearchBar onResultsChange={handleSearchResultsChange} />
      </div>

      {/* Filter Controls - only show when not searching */}
      {!searchResults && (
        <div className="mb-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-2 min-w-max">
              <ChipsetFilterComponent
                selectedChipset={ChipsetFilter}
                chipsetOptions={
                  chipsetOptions as {
                    value: string;
                    label: string;
                    count: number;
                  }[]
                }
                onChipsetChange={handleChipsetChange}
              />

              <PlayMethodFilterComponent
                selectedPlayMethod={PlayMethodFilter}
                playMethodOptions={playMethodOptions}
                onPlayMethodChange={handlePlayMethodChange}
              />

              <PerformanceFilterComponent
                activeFilter={PerformanceFilter}
                onFilterChange={handleFilterChange}
                displayStats={GamesPage.ratingCounts}
                formatRatingLabel={formatRatingLabel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {getGamesToDisplay()}
      </div>

      {/* Infinite scroll observer */}
      {!isSearchMode && hasNextPage && (
        <div
          ref={loadMoreRef}
          className="w-full h-20 flex items-center justify-center mt-8"
        ></div>
      )}
    </>
  );
}
