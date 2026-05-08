'use client';

import { LoadingSpinnerIcon } from '@/components/ui/loading-spinner-icon';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (next: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  isLoading = false,
  placeholder = 'Search for a game...',
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-4xl">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-input/30 w-full h-14 px-6 pr-12 rounded-full border-2 focus:outline-none focus:ring-2 focus:border-0 focus:ring-blue-400 border-input/70 text-lg backdrop-blur-sm transition-all duration-200"
        />
        <div className="absolute right-4 top-4 text-[#535353]">
          {isLoading ? <LoadingSpinnerIcon /> : <Search size={24} />}
        </div>
      </div>
    </div>
  );
}
