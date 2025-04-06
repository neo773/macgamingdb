"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { SteamGame } from '@/lib/algolia';
import { trpc } from '@/lib/trpc/provider';

type SearchBarProps = {
  onResultsChange?: (results: SteamGame[] | null) => void;
};

export default function SearchBar({ onResultsChange }: SearchBarProps = {}) {
  const [query, setQuery] = useState('');
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
    if (onResultsChange) {
      if (query.trim().length === 0) {
        onResultsChange(null);
      } else if (data) {
        onResultsChange(data);
      }
    }
  }, [data, query, onResultsChange]);

  // Also update loading state when isLoading changes
  useEffect(() => {
    if (onResultsChange && query.trim().length > 0) {
      // This helps trigger the loading skeletons in the parent component
      if (isLoading) {
        onResultsChange([]); // Empty array to trigger loading state
      }
    }
  }, [isLoading, onResultsChange, query]);

  return (
    <div className="relative w-full max-w-4xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder="Search for a game..."
          className="w-full h-14 px-6 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/60 dark:border-gray-700 text-lg backdrop-blur-sm"
        />
        <div className="absolute right-4 top-4 text-blue-400">
          {isLoading ? (
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <Search size={24} />
          )}
        </div>
      </div>
    </div>
  );
} 