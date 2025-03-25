"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { SteamGame } from '@/lib/algolia';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SteamGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle search
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/games/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setResults(data.games || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounce search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query) handleSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, handleSearch]);

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

  return (
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search for a game..."
          className="w-full h-12 px-4 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
        <div className="absolute right-3 top-3 text-gray-400">
          <Search size={20} />
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <ul className="py-2">
            {results.map((game) => (
              <li
                key={game.objectID}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleGameSelect(game.objectID)}
              >
                <div className="font-medium">{game.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {game.releaseYear ? `Released: ${game.releaseYear}` : ''}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isLoading && (
        <div className="absolute right-3 top-3 text-blue-500">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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