"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { SteamGame } from '@/lib/algolia';
import { trpc } from '@/lib/trpc/provider';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SteamGame[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data, isLoading } = trpc.game.search.useQuery(
    { query: query },
    { 
      enabled: query.trim().length > 0,
      placeholderData: (prev) => prev,
    }
  );

  // Update results when data changes
  useEffect(() => {
    if (data) {
      setResults(data || []);
    }
  }, [data]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigate to game page when game is selected
  const handleGameSelect = (gameId: string) => {
    router.push(`/games/${gameId}`);
    setShowResults(false);
    setQuery('');
  };

  // Add keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showResults) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          handleGameSelect(results[selectedIndex].objectID);
        }
        break;
    }
  }, [showResults, results, selectedIndex]);

  return (
    <div className="relative w-full max-w-4xl" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a game..."
          className="w-full h-14 px-6 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/60 dark:border-gray-700 text-lg backdrop-blur-sm"
        />
        <div className="absolute right-4 top-4 text-gray-400">
          <Search size={24} />
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-4 bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {results.map((game, index) => (
              <div
                key={game.objectID}
                className={`relative group cursor-pointer transition-transform duration-200 hover:scale-105 ${
                  selectedIndex === index ? 'ring-2 ring-blue-500 rounded-xl' : ''
                }`}
                onClick={() => handleGameSelect(game.objectID)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="aspect-[460/215] rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 z-10" />
                  <img
                    src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.objectID}/header.jpg`}
                    alt={game.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-game.jpg' // Make sure to add a placeholder image
                    }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/90 z-20">
                  <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                    {game.name}
                  </div>
                  {game.releaseYear && (
                    <div className="text-sm text-gray-300">
                      {game.releaseYear}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute right-4 top-4 text-blue-500">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
    </div>
  );
} 