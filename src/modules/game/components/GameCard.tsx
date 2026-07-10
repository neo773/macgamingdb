'use client';

import Link from 'next/link';
import { type PerformanceRating } from 'macgamingdb-server/drizzle/types';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { useState } from 'react';
import { LogoIcon } from '@/modules/layout/components/LogoIcon';

type GameCardGame = {
  ref: string;
  slug: string | null;
  name: string;
  coverImage: string | null;
  releaseYear: number | null;
  performanceRating?: PerformanceRating;
};

export function GameCard({ game }: { game: GameCardGame }) {
  const [showFallback, setShowFallback] = useState(false);

  return (
    <Link
      href={`/games/${game.slug ?? game.ref}`}
      className="relative group cursor-pointer transition-transform duration-200 hover:scale-105 block"
    >
      <div className="aspect-[460/215] rounded-xl overflow-hidden relative ring-1 ring-gray-800 shadow-lg shadow-blue-900/20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

        {showFallback || !game.coverImage ? (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <LogoIcon width={60} height={60} className="opacity-60" />
          </div>
        ) : (
          <img
            src={game.coverImage}
            alt={`${game.name} cover art`}
            className="w-full h-full object-cover"
            onError={() => setShowFallback(true)}
          />
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-transparent">
        <div className="font-medium text-white group-hover:text-blue-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
          {game.name}
          {isDefined(game.releaseYear) && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              {game.releaseYear}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
