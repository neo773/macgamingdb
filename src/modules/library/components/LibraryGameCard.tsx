'use client';

import { Plus } from 'lucide-react';
import { type PerformanceRating } from '@macgamingdb/server/drizzle/types';
import { formatRatingLabel } from '@macgamingdb/server/utils/formatRatingLabel';
import { GameCard } from '@/modules/game/components/GameCard';

const PERF_BADGE: Record<PerformanceRating, string> = {
  EXCELLENT: 'text-green-300 border-green-400/30',
  VERY_GOOD: 'text-purple-300 border-purple-400/30',
  GOOD: 'text-blue-300 border-blue-400/30',
  PLAYABLE: 'text-yellow-300 border-yellow-400/30',
  BARELY_PLAYABLE: 'text-orange-300 border-orange-400/30',
  UNPLAYABLE: 'text-red-300 border-red-400/30',
};

function formatPlaytime(minutes: number): string | null {
  if (minutes <= 0) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  return `${hours}h`;
}

export interface LibraryGameCardProps {
  appId: string;
  name: string | null;
  rating: PerformanceRating | null;
  playtimeMinutes: number;
}

export function LibraryGameCard({
  appId,
  name,
  rating,
  playtimeMinutes,
}: LibraryGameCardProps) {
  const playtime = formatPlaytime(playtimeMinutes);

  const unrated = !rating;

  return (
    <div className="relative group">
      <div className={unrated ? 'opacity-50 grayscale transition-opacity duration-200 group-hover:opacity-70' : ''}>
        <GameCard
          game={{
            objectID: appId,
            name: name ?? `App ${appId}`,
            url: '',
            performanceRating: rating ?? undefined,
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-30 transition-transform duration-200 group-hover:scale-105">
        {rating && (
          <div className="absolute top-2 left-2">
            <span
              className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-black/60 border backdrop-blur-sm ${PERF_BADGE[rating]}`}
            >
              {formatRatingLabel(rating)}
            </span>
          </div>
        )}

        {playtime && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-black/60 text-gray-200 border border-white/10 backdrop-blur-sm">
              {playtime}
            </span>
          </div>
        )}

        {unrated && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-black shadow-lg">
              <Plus className="size-3.5" strokeWidth={2.5} />
              Review
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
