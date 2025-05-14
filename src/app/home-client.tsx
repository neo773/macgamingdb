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
import { PerformanceEnum } from "@/server/schema";

// Featured games data
const featuredGames = [
  {
    name: "Grand Theft Auto V Legacy",
    objectID: "271590",
  },
  {
    name: "The Witcher 3: Wild Hunt",
    objectID: "292030",
  },
  {
    name: "Red Dead Redemption 2",
    objectID: "1174180",
  },
  {
    name: "Cyberpunk 2077",
    objectID: "1091500",
  },
  {
    name: "Elden Ring",
    objectID: "1245620",
  },
  {
    name: "Counter-Strike 2",
    objectID: "730",
  },
];

// Performance badge color mapping

// Props for client component from server 
interface HomeClientProps {
  ratingCounts: Record<string, number>;
}

export default function HomeClient({ 
  ratingCounts 
}: HomeClientProps) {
  const [searchResults, setSearchResults] = useState<
    SteamGameSearchObject[] | null
  >(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Game pagination state for the selected filter
  const {
    data: gamesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isGamesLoading,
  } = trpc.game.getGames.useInfiniteQuery(
    {
      limit: 6,
      filter: activeFilter as any,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: null,
      enabled: !!activeFilter, // Only fetch when a filter is selected
      staleTime: Infinity, 
      refetchOnWindowFocus: false,
    }
  );

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || !activeFilter) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // If the loadMoreRef element is visible and we have more pages to load
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, activeFilter]);

  // Simple handler for search results
  const handleSearchResultsChange = (
    results: SteamGameSearchObject[] | null,
    isLoading: boolean
  ) => {
    setSearchResults(results);
    setIsSearchLoading(isLoading);
    if (results) {
      setActiveFilter(null); // Clear filter when searching
    }
  };

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // Function to get all games from all pages
  const getAllGames = React.useCallback(() => {
    if (!gamesData?.pages) return [];
    
    return gamesData.pages.flatMap(page => page.games || []);
  }, [gamesData?.pages]);

  // Game card component to display either featured or search result games
  const GameCard = ({ game }: { game: SteamGameSearchObject & { performanceRating?: PerformanceRating } }) => {
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
  };

  // Loading skeleton for game cards
  const GameCardSkeleton = () => (
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

  // Display loading skeletons while waiting for search results
  const renderGameCards = () => {
    // Show search results if available
    if (isSearchLoading) {
      return Array(6)
        .fill(0)
        .map((_, index) => <GameCardSkeleton key={`skeleton-${index}`} />);
    }

    if (searchResults && searchResults.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-xl text-gray-400">
            No games found matching your search.
          </p>
        </div>
      );
    }

    if (searchResults && searchResults.length > 0) {
      return searchResults.map((game) => (
        <GameCard key={game.objectID} game={game} />
      ));
    }

    // If a filter is active
    if (activeFilter) {
      // Show loading skeletons initially
      if (isGamesLoading && !gamesData) {
        return Array(6)
          .fill(0)
          .map((_, index) => <GameCardSkeleton key={`skeleton-${index}`} />);
      }

      // If we have game data from trpc, display those games
      const allGames = getAllGames();
      
      if (allGames.length === 0) {
        return (
          <div className="col-span-full text-center py-8">
            <p className="text-xl text-gray-400">
              No games found for this filter.
            </p>
          </div>
        );
      }
      
      // Display all games with their loading state
      return (
        <>
          {allGames.map((game) => (
            <GameCard 
              key={game.id} 
              game={{
                objectID: game.id,
                name: JSON.parse(game.details || '{"name":"Unknown"}').name,
                url: '',
                performanceRating: game.performanceRating,
              }}
            />
          ))}
          
          {/* Show loading skeletons at the bottom while fetching more */}
          {isFetchingNextPage && (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <GameCardSkeleton key={`skeleton-next-${index}`} />
              ))
          )}
        </>
      );
    }

    // Default to featured games when no filter is active
    return featuredGames.map((game) => (
      <GameCard key={game.objectID} game={game as SteamGameSearchObject} />
    ));
  };

  // Format rating labels
  const formatRatingLabel = (rating: string) => {
    switch(rating) {
      case 'ALL': return 'All Games';
      case 'EXCELLENT': return 'Excellent';
      case 'GOOD': return 'Good';
      case 'BARELY_PLAYABLE': return 'Barely Playable';
      case 'PLAYABLE': return 'Playable';
      case 'UNPLAYABLE': return 'Unplayable';
      default: return rating;
    }
  };

  return (
    <>
      <div className="flex justify-center px-8 md:p-0 mb-8">
        <SearchBar onResultsChange={handleSearchResultsChange} />
      </div>
    
      {/* Rating Filter Tabs - only show when not searching */}
      {!searchResults && (
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {["ALL", ...PerformanceEnum.options].map((rating) => (
              <Button
                variant="outline"
                key={rating}
                onClick={() => handleFilterChange(rating)}
                className={cn(
                  "flex items-center gap-2 rounded-xl  text-gray-400 border-0 hover:bg-gray-800 hover:text-gray-200",
                  activeFilter === rating
                    ? "border-2 border-gray-600  text-white"
                    : ""
                )}
                style={{
                  background:  activeFilter === rating ? 'linear-gradient(139deg, rgb(34 86 134 / 18%) 0%, rgb(43 170 255 / 10%) 100%)': ''
                }}
              >
             {formatRatingLabel(rating)}{" "}
                {ratingCounts[rating] !== undefined && (
                  <span className={cn("ml-1 px-2 py-0.5 rounded-md text-xs font-medium", 
                    activeFilter === rating ? "bg-blue-500/20" : "bg-gray-600/40"
                  )}>
                    {ratingCounts[rating]}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {renderGameCards()}
      </div>

      {/* Infinite scroll observer element - only visible when filtering is active */}
      {!searchResults && activeFilter && hasNextPage && (
        <div 
          ref={loadMoreRef} 
          className="w-full h-20 flex items-center justify-center mt-8"
        >
        </div>
      )}
    </>
  );
} 