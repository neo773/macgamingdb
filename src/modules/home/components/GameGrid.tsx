'use client';

import { GameCard } from '@/modules/game/components/GameCard';
import { GameCardSkeleton } from '@/modules/game/components/GameCardSkeleton';
import { type RouterOutputs } from '@/lib/trpc/provider';
import { type PerformanceRating } from '@macgamingdb/server/drizzle/types';
import { normalizeGameDetails } from '@macgamingdb/server/utils/normalizeGameDetails';

interface GameFromDB {
  id: string;
  slug: string | null;
  source: string;
  details: string | null;
  performanceRating: string | null;
}

interface GameGridProps {
  isLoading: boolean;
  searchResults: RouterOutputs['game']['search'] | null;
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
        {Array(6)
          .fill(null)
          .map((_, i) => (
            <GameCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>
    );
  }

  if (searchResults) {
    if (searchResults.length === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="col-span-full text-center py-8">
            <p className="text-xl text-gray-400">
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
          <p className="text-xl text-gray-400">
            No games found with the selected filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {games.map((game) => {
        const gameDetails = normalizeGameDetails(game.source, game.details);

        return (
          <GameCard
            key={game.id}
            game={{
              objectID: game.id,
              slug: game.slug,
              name: gameDetails?.name ?? 'Unknown',
              url: '',
              releaseYear: gameDetails?.releaseYear ?? undefined,
              performanceRating: (game.performanceRating ?? undefined) as PerformanceRating | undefined,
            }}
          />
        );
      })}

      {isFetchingNextPage &&
        Array(6)
          .fill(null)
          .map((_, i) => <GameCardSkeleton key={`loading-more-${i}`} />)}
    </div>
  );
}
