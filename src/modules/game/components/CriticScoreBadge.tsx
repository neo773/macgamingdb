import { isDefined } from 'macgamingdb-shared/utils/isDefined';

const STRONG_SCORE = 75;
const FAIR_SCORE = 50;

type CriticScoreBadgeProps = {
  criticRating: number | null;
  criticRatingCount: number | null;
};

const toneFor = (criticRating: number): string => {
  if (criticRating >= STRONG_SCORE) {
    return 'border-emerald-700/60 text-emerald-300';
  }
  if (criticRating >= FAIR_SCORE) {
    return 'border-amber-700/60 text-amber-300';
  }
  return 'border-red-800/60 text-red-300';
};

export const CriticScoreBadge = ({
  criticRating,
  criticRatingCount,
}: CriticScoreBadgeProps) => {
  if (!isDefined(criticRating) || !isDefined(criticRatingCount)) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-baseline gap-2 rounded-lg border bg-white/5 px-3 py-2 ${toneFor(criticRating)}`}
    >
      <span className="text-lg font-semibold tabular-nums">{criticRating}</span>
      <span className="text-xs text-gray-400">
        critic score from {criticRatingCount}{' '}
        {criticRatingCount === 1 ? 'review' : 'reviews'} · via IGDB
      </span>
    </div>
  );
};
