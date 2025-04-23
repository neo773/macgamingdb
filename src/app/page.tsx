"use client";

import SearchBar from "@/components/search/search-bar";
import { useState } from "react";
import * as React from "react";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Link from "next/link";
import { SteamGameSearchObject } from "@/lib/steam";
import { LogoIcon } from "@/components/LogoIcon";

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

export default function Home() {
  const [searchResults, setSearchResults] = useState<
    SteamGameSearchObject[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simple handler for search results
  const handleSearchResultsChange = (
    results: SteamGameSearchObject[] | null,
    isLoading: boolean
  ) => {
    setSearchResults(results);
    setIsLoading(isLoading);
  };
  // Game card component to display either featured or search result games
  const GameCard = ({ game }: { game: SteamGameSearchObject }) => {
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
    if (isLoading) {
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

    return featuredGames.map((game) => (
      <GameCard key={game.objectID} game={game as SteamGameSearchObject} />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <p className="text-xl md:text-3xl text-gray-300 mb-8 mx-6 text-center font-medium md:mx-auto">
        Find out how your favorite games <br />
        perform on Mac across different compatibility layers
      </p>

      <div className="flex justify-center px-8 md:p-0">
        <SearchBar onResultsChange={handleSearchResultsChange} />
      </div>
      {/* <div className="w-full max-w-7xl mx-auto px-8 mt-6">
        <div className="bg-primary-gradient rounded-xl p-4 border border-[#272727]">
          <div className="flex flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0 inline-flex items-center justify-center size-10 rounded-lg bg-[#272727]">
              <span className="text-lg">🎉</span>
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">300+ Community Reports</h2>
              <p className="text-sm text-gray-400">
                Thank you to everyone who has contributed 
              </p>
            </div>
          </div>
        </div>
      </div> */}

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 pb-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {renderGameCards()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
