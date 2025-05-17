"use client";

import { useState, useRef, useEffect } from "react";
import * as React from "react";
import { SteamGameSearchObject } from "@/server/helpers/steam";
import { trpc } from "@/lib/trpc/provider";
import { PerformanceRating } from "@prisma/client";
import SearchBar from "@/components/search/SearchBar";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  SearchURLParamsKeys,
  PerformanceFilter,
  createFilterConfig,
} from "@/lib/constants";
import { GameCard } from "@/components/game/Card";
import { GameCardSkeleton } from "@/components/game/SekeletonCard";
import Filters from "@/components/search/Filters";
import { formatRatingLabel, getChipsetCombinations } from "@/server/utils";

// Home client props
interface HomeClientProps {
  GamesPage: {
    games: Array<{
      id: string;
      details: string | null;
      performanceRating: PerformanceRating;
      reviewCount: number;
      updatedAt: Date;
      createdAt: Date;
    }>;
    nextCursor: string | undefined;
    totalCount: number;
    ratingCounts: Record<string, number>;
  };
  PerformanceFilter: PerformanceFilter;
  ChipsetFilter: string;
}

export default function HomeClient({
  GamesPage: GamesPage,
  PerformanceFilter: PerformanceFilter,
  ChipsetFilter: ChipsetFilter,
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
    { value: "all", label: "All Chipsets" },
    ...getChipsetCombinations(),
  ];

  // Get the current filter configuration for queries
  const filterConfig = React.useMemo(() => {
    return createFilterConfig(PerformanceFilter, ChipsetFilter);
  }, [PerformanceFilter, ChipsetFilter]);

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
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !isSearchMode, // Always fetch when not searching
      staleTime: 30000, // Cache for 30 seconds
      initialData: {
        pages: [GamesPage],
        pageParams: [undefined],
      },
    }
  );

  // Update URL when filters change
  const updateFilters = (performance: PerformanceFilter, chipset: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (performance !== "ALL") {
      params.set(SearchURLParamsKeys.PERFORMANCE, performance);
    } else {
      params.delete(SearchURLParamsKeys.PERFORMANCE);
    }

    if (chipset !== "all") {
      params.set(SearchURLParamsKeys.CHIPSET, chipset);
    } else {
      params.delete(SearchURLParamsKeys.CHIPSET);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle performance filter change
  const handleFilterChange = (filter: PerformanceFilter) => {
    updateFilters(filter, ChipsetFilter);
  };

  // Handle chipset change
  const handleChipsetChange = (value: string) => {
    updateFilters(PerformanceFilter, value);
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
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, isSearchMode]);

  // Handle search results
  const handleSearchResultsChange = (
    results: SteamGameSearchObject[] | null,
    isLoading: boolean
  ) => {
    setSearchResults(results);
    setIsSearchLoading(isLoading);

    if (results === null && searchResults !== null) {
      // Clear search results, reset URL to default
      updateFilters("ALL", "all");
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
              name: game.details ? JSON.parse(game.details).name : "Unknown",
              url: "",
              performanceRating: game.performanceRating,
            }}
          />
        ))}

        {isFetchingNextPage &&
          Array(3)
            .fill(null)
            .map((_, i) => <GameCardSkeleton key={`loading-more-${i}`} />)}
      </>
    );
  };

  return (
    <>
      <div className="flex justify-center px-8 md:p-0 mb-8">
        <SearchBar onResultsChange={handleSearchResultsChange} />
      </div>

      {/* Filter Controls - only show when not searching */}
      {!searchResults && (
        <div className="mb-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-2 min-w-max">
              <Filters
                selectedChipset={ChipsetFilter}
                activeFilter={PerformanceFilter}
                displayStats={GamesPage.ratingCounts}
                chipsetOptions={
                  chipsetOptions as {
                    value: string;
                    label: string;
                    count: number;
                  }[]
                }
                formatRatingLabel={formatRatingLabel}
                handleFilterChange={handleFilterChange}
                handleChipsetChange={handleChipsetChange}
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
