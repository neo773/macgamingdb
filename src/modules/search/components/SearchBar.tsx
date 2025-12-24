'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

import { trpc } from '@/lib/trpc/provider';
import { useDebounce } from 'use-debounce';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { type SteamGameSearchObject } from '@macgamingdb/server/api/steam';

type SearchBarProps = {
  onResultsChange?: (
    results: SteamGameSearchObject[] | null,
    isLoading: boolean
  ) => void;
};

export default function SearchBar({ onResultsChange }: SearchBarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery] = useDebounce(query, 300);

  const { data, isLoading } = trpc.game.search.useQuery(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.trim().length > 0,
      placeholderData: (prev) => prev,
    }
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedQuery) {
      params.set('q', debouncedQuery);
    } else {
      params.delete('q');
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams]);

  useEffect(() => {
    if (onResultsChange) {
      const results = debouncedQuery.trim() === '' ? null : data || null;
      onResultsChange(results, isLoading);
    }
  }, [data, debouncedQuery, isLoading, onResultsChange]);

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
          className="bg-input/30 w-full h-14 px-6 pr-12 rounded-full border-2 focus:outline-none focus:ring-2 focus:border-0 focus:ring-blue-400 border-input/70 text-lg backdrop-blur-sm  transition-all duration-200"
        />
        <div className="absolute right-4 top-4 text-[#535353]">
          {isLoading ? (
            <svg
              className="animate-spin h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
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
