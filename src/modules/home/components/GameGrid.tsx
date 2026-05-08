'use client';

import { GameCard } from '@/modules/game/components/GameCard';
import { GameCardSkeleton } from '@/modules/game/components/GameCardSkeleton';
import { type SteamGameSearchObject } from '@macgamingdb/server/api/steam';
import { type PerformanceRating } from '@macgamingdb/server/drizzle/types';

interface GameFromDB {
  id: string;
  details: string | null;
  performanceRating: string | null;
}

interface GameGridProps {
  isLoading: boolean;
  searchResults: SteamGameSearchObject[] | null;
  games: GameFromDB[];
  isFetchingNextPage: boolean;
}

export function GameGrid({
  isLoading,
  searchResults,
  games,
  isFetchingNextPage,
}: GameGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          'skeleton-1',
          'skeleton-2',
          'skeleton-3',
          'skeleton-4',
          'skeleton-5',
          'skeleton-6',
        ].map((skeletonKey) => (
          <GameCardSkeleton key={skeletonKey} />
        ))}
      </div>
    );
  }

  if (searchResults) {
    if (searchResults.length === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="col-span-full text-center py-8">
            <p className="text-xl text-zinc-400">
              No games found matching your search.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {searchResults.map((game) => (
          <GameCard key={game.objectID} game={game} />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="col-span-full text-center py-8">
          <p className="text-xl text-zinc-400">
            No games found with the selected filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={{
            objectID: game.id,
            name: game.details ? JSON.parse(game.details).name : 'Unknown',
            url: '',
            performanceRating: (game.performanceRating ?? undefined) as PerformanceRating | undefined,
          }}
        />
      ))}

      {isFetchingNextPage &&
        [
          'loading-more-1',
          'loading-more-2',
          'loading-more-3',
          'loading-more-4',
          'loading-more-5',
          'loading-more-6',
        ].map((skeletonKey) => <GameCardSkeleton key={skeletonKey} />)}
    </div>
  );
}
