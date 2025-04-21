"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { type SteamGame } from "@/lib/steam";
import { trpc } from "@/lib/trpc/provider";
import { useDebounce } from 'use-debounce';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

type SearchBarProps = {
  onResultsChange?: (results: SteamGame[] | null, isLoading: boolean) => void;
};

export default function SearchBar({ onResultsChange }: SearchBarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || "");
  const [debouncedQuery] = useDebounce(query, 300);

  const { data, isLoading } = trpc.game.search.useQuery(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.trim().length > 0,
      placeholderData: (prev) => prev,
    },
  );

  // Update URL when search query changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (debouncedQuery) {
      params.set('q', debouncedQuery);
    } else {
      params.delete('q');
    }
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams]);

  // Pass data and loading state to parent
  useEffect(() => {
    if (onResultsChange) {
      const results = debouncedQuery.trim() === "" ? null : data || null;
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
          className="w-full h-14 px-6 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 border-blue-400 text-lg backdrop-blur-sm"
          style={{
            background:
              "linear-gradient(139deg, rgb(47 144 235 / 18%) 0%, rgba(43, 161, 240, 0.1) 100%)",
          }}
        />
        <div className="absolute right-4 top-4 text-blue-400">
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
