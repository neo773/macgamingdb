"use client";

import { useState, useRef, useEffect } from "react";
import * as React from "react";
import Link from "next/link";
import { SteamGameSearchObject } from "@/server/helpers/steam";
import { LogoIcon } from "@/components/shared/LogoIcon";
import { trpc } from "@/lib/trpc/provider";
import { PerformanceRating } from "@prisma/client";
import { cn } from "@/components/utils";
import SearchBar from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import {
  PerformanceEnum,
  ChipsetEnum,
  ChipsetVariantEnum,
} from "@/server/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// URL parameter keys
enum SearchURLParamsKeys {
  CHIPSET = "chipset",
  PERFORMANCE = "performance",
}

// Performance filter type
type PerformanceFilter = "ALL" | z.infer<typeof PerformanceEnum>;

// Interface for initial data from server
interface InitialData {
  globalStats: Record<string, number>;
  chipsetOptions: Array<{
    value: string;
    label: string;
    count: number;
  }>;
  featuredGames: Array<{
    id: string;
    details: string | null;
    performanceRating: PerformanceRating;
    reviewCount: number;
  }>;
}

// Home client props
interface HomeClientProps {
  initialData: InitialData;
}

export default function HomeClient({ initialData }: HomeClientProps) {
  // Router and URL params
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Parse URL parameters or use defaults
  const performanceParam = searchParams.get(SearchURLParamsKeys.PERFORMANCE) as PerformanceFilter | null;
  const chipsetParam = searchParams.get(SearchURLParamsKeys.CHIPSET) || "all";
  
  // Local state
  const [searchResults, setSearchResults] = useState<SteamGameSearchObject[] | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Current active filter
  const activeFilter = performanceParam || "ALL";
  
  // Current selected chipset
  const selectedChipset = chipsetParam;
  
  // Parse chipset options from initial data
  const chipsetOptions = React.useMemo(() => {
    return [
      { value: "all", label: "All Chipsets" },
      ...initialData.chipsetOptions
    ];
  }, [initialData.chipsetOptions]);
  
  // Get the current filter configuration for queries
  const filterConfig = React.useMemo(() => {
    if (selectedChipset === "all") {
      return {
        limit: 6,
        filter: activeFilter,
      };
    }
    
    // Only split and include chipset params if not "all"
    const [chipset, variant] = selectedChipset.split("-") as [
      z.infer<typeof ChipsetEnum>, 
      z.infer<typeof ChipsetVariantEnum>
    ];
    
    return {
      limit: 6,
      filter: activeFilter,
      chipset,
      chipsetVariant: variant
    };
  }, [activeFilter, selectedChipset]);
  
  // Track if we're in search mode
  const isSearchMode = !!searchResults;
  
  // Get filtered games - always enabled when not searching
  const {
    data: gamesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isGamesLoading,
  } = trpc.game.getGames.useInfiniteQuery({
    ...filterConfig
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !isSearchMode, // Always fetch when not searching
    staleTime: 30000, // Cache for 30 seconds
  });
  
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
    updateFilters(filter, selectedChipset);
  };
  
  // Handle chipset change
  const handleChipsetChange = (value: string) => {
    updateFilters(activeFilter, value);
  };
  
  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isSearchMode || isFetchingNextPage) return;
    
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
  
  // Get the appropriate stats to display
  const displayStats = React.useMemo(() => {
    if (isSearchMode || selectedChipset === "all") {
      return initialData.globalStats;
    }
    
    // If we have filtered data, show current page's stats
    if (gamesData?.pages && gamesData.pages.length > 0) {
      return gamesData.pages[0].ratingCounts;
    }
    
    return initialData.globalStats;
  }, [isSearchMode, selectedChipset, gamesData, initialData.globalStats]);
  
  // Get games to display (either search results or filtered games)
  const getGamesToDisplay = () => {
    // Show loading skeleton while loading
    if (isSearchLoading || (isGamesLoading && !isSearchMode)) {
      return Array(6).fill(null).map((_, i) => <GameCardSkeleton key={`skeleton-${i}`} />);
    }
    
    // Show search results if available
    if (searchResults) {
      if (searchResults.length === 0) {
        return (
          <div className="col-span-full text-center py-8">
            <p className="text-xl text-gray-400">No games found matching your search.</p>
          </div>
        );
      }
      
      return searchResults.map((game) => <GameCard key={game.objectID} game={game} />);
    }
    
    // Show filtered games from our database
    const allFilteredGames = gamesData?.pages.flatMap(page => page.games) || [];
    
    if (allFilteredGames.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-xl text-gray-400">No games found with the selected filters.</p>
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
              url: '',
              performanceRating: game.performanceRating
            }}
          />
        ))}
        
        {isFetchingNextPage && Array(3)
          .fill(null)
          .map((_, i) => <GameCardSkeleton key={`loading-more-${i}`} />)}
      </>
    );
  };
  
  // Format performance rating labels
  const formatRatingLabel = (rating: string) => {
    switch (rating) {
      case "ALL": return "All Games";
      case "EXCELLENT": return "Excellent";
      case "GOOD": return "Good";
      case "BARELY_PLAYABLE": return "Barely Playable";
      case "PLAYABLE": return "Playable";
      case "UNPLAYABLE": return "Unplayable";
      default: return rating;
    }
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
              <Select value={selectedChipset} onValueChange={handleChipsetChange}>
                <SelectTrigger className="flex items-center gap-2 rounded-xl border-2">
                  <SelectValue placeholder="Select Chipset" />
                </SelectTrigger>
                <SelectContent className="bg-[#171717e0] backdrop-blur-md">
                  {chipsetOptions
                    .sort((a, b) => {
                      // Extract the chipset series (M1, M2, M3, etc.)
                      const seriesA = a.label.split(' ')[0];
                      const seriesB = b.label.split(' ')[0];
                      
                      // Compare the series first
                      if (seriesA !== seriesB) {
                        return seriesA.localeCompare(seriesB);
                      }
                      
                      // If same series, sort by variant
                      return a.label.localeCompare(b.label);
                    })
                    .map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value} 
                        className="aria-selected:bg-white focus:bg-white/90 focus:text-black"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              {(["ALL", ...PerformanceEnum.options] as const).map((rating) => (
                <Button
                  key={rating}
                  onClick={() => handleFilterChange(rating)}
                  className={cn(
                    "group flex items-center gap-2 rounded-xl text-white/80 border-0 hover:bg-white hover:text-black",
                    activeFilter === rating ? "bg-white/90 text-black" : "bg-input/40"
                  )}
                >
                  {formatRatingLabel(rating)}{" "}
                  {displayStats && displayStats[rating] !== undefined && (
                    <span
                      className={cn(
                        "ml-1 px-2 py-0.5 rounded-md text-xs font-medium group-hover:bg-black group-hover:text-white",
                        activeFilter === rating ? "bg-black text-white" : "bg-input/70"
                      )}
                    >
                      {displayStats[rating]}
                    </span>
                  )}
                </Button>
              ))}
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

// Game Card Component
function GameCard({
  game,
}: {
  game: SteamGameSearchObject & { performanceRating?: PerformanceRating };
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/games/${game.objectID}`}
      className="relative group cursor-pointer transition-transform duration-200 hover:scale-105 block"
    >
      <div className="aspect-[460/215] rounded-xl overflow-hidden relative ring-1 ring-gray-800 shadow-lg shadow-blue-900/20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />
        {!imageError ? (
          <img
            src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.objectID}/header.jpg`}
            alt={game.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <LogoIcon width={60} height={60} className="opacity-60" />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-transparent">
        <div className="font-medium text-white group-hover:text-blue-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
          {game.name}
        </div>
      </div>
    </Link>
  );
}

// Loading skeleton
function GameCardSkeleton() {
  return (
    <div className="relative">
      <div className="aspect-[460/215] rounded-xl overflow-hidden bg-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="h-5 bg-gray-700 rounded animate-pulse w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded animate-pulse w-1/3"></div>
      </div>
    </div>
  );
}
