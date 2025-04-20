"use client";

import SearchBar from "@/components/search/search-bar";
import Image from "next/image";
import { useState } from "react";
import { SteamGame } from "@/lib/algolia";
import * as React from "react";
import { SVGProps } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer";
import Header from "@/components/header";

const GameIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 231.062 144.438"
    {...props}
  >
    <path
      fill={props.fill || "#fff"}
      fillOpacity={0.85}
      d="M49.063 56c0-3.5 2.187-5.75 5.937-5.75h16.25V34.062c0-3.624 2.125-5.874 5.688-5.874 3.437 0 5.562 2.25 5.562 5.875V50.25h15.625c3.937 0 6.313 2.25 6.313 5.75 0 3.688-2.376 5.938-6.313 5.938H82.5v16.25c0 3.624-2.125 5.874-5.563 5.874-3.562 0-5.687-2.25-5.687-5.874v-16.25H55c-3.75 0-5.938-2.25-5.938-5.938Zm117.687-1.25c-6.312 0-11.562-5.125-11.562-11.563 0-6.437 5.25-11.562 11.562-11.562 6.438 0 11.625 5.125 11.625 11.563 0 6.437-5.187 11.562-11.625 11.562Zm-24.812 24.625a11.536 11.536 0 0 1-11.563-11.563c0-6.374 5.187-11.562 11.563-11.562 6.437 0 11.624 5.188 11.624 11.563 0 6.437-5.187 11.562-11.624 11.562ZM29.813 144.438c10.375 0 18.062-3.938 24.687-12.126l14.875-18c2.125-2.562 4.5-3.75 7.063-3.75h78.187c2.563 0 4.937 1.188 7.063 3.75l14.812 18c6.688 8.188 14.375 12.126 24.75 12.126 17.875 0 29.812-11.938 29.812-30.25 0-7.876-1.874-17-5-27.5-4.937-16.5-13.562-38.938-21.874-56.5-6.813-14.25-10.25-20.5-26.813-24.25C161.938 2.374 140.812.125 115.5.125c-25.25 0-46.375 2.25-61.813 5.813-16.562 3.75-20 10-26.812 24.25-8.313 17.562-16.938 40-21.875 56.5-3.125 10.5-5 19.624-5 27.5 0 18.312 11.938 30.25 29.813 30.25Z"
    />
  </svg>
);

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
  const [searchResults, setSearchResults] = useState<SteamGame[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Simple handler for search results
  const handleSearchResultsChange = (
    results: SteamGame[] | null,
    isLoading: boolean
  ) => {
    setSearchResults(results);
    setIsLoading(isLoading);
  };

  // Navigate to game page when a game is selected
  const handleGameClick = (gameId: string) => {
    router.push(`/games/${gameId}`);
  };

  // Game card component to display either featured or search result games
  const GameCard = ({ game }: { game: SteamGame }) => (
    <div
      className="relative group cursor-pointer transition-transform duration-200 hover:scale-105"
      onClick={() => handleGameClick(game.objectID)}
    >
      <div className="aspect-[460/215] rounded-xl overflow-hidden relative ring-1 ring-gray-800 shadow-lg shadow-blue-900/20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />
        <img
          src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.objectID}/header.jpg`}
          alt={game.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-game.jpg";
          }}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-transparent">
        <div className="font-medium text-white group-hover:text-blue-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
          {game.name}
        </div>
        {game.releaseYear && (
          <div className="text-sm text-gray-300">{game.releaseYear}</div>
        )}
      </div>
    </div>
  );

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
      <GameCard key={game.objectID} game={game as SteamGame} />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <div className="flex justify-center">
        <SearchBar onResultsChange={handleSearchResultsChange} />
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {renderGameCards()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
