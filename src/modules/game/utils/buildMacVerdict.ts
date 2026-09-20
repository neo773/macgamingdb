import { type RouterOutputs } from '@/modules/trpc/types/RouterOutputs';
import { type MacVerdict } from '@/modules/game/types/MacVerdict';
import { type PlayMethodSummary } from '@/modules/game/types/PlayMethodSummary';

const MIN_REPORTS_FOR_CONFIDENCE = 3;
const MIN_FPS_COVERAGE = 0.5;

const PERFORMANCE_RANK: Record<string, number> = {
  EXCELLENT: 6,
  VERY_GOOD: 5,
  GOOD: 4,
  PLAYABLE: 3,
  BARELY_PLAYABLE: 2,
  UNPLAYABLE: 1,
};

type GameReview = Pick<
  RouterOutputs['game']['getById']['reviews'][number],
  'playMethod' | 'performance' | 'fps' | 'chipset' | 'chipsetVariant'
>;

const formatChip = (review: Pick<GameReview, 'chipset' | 'chipsetVariant'>) =>
  review.chipsetVariant === 'BASE'
    ? review.chipset
    : `${review.chipset} ${review.chipsetVariant.charAt(0)}${review.chipsetVariant.slice(1).toLowerCase()}`;

const medianOf = (values: number[]): number | undefined => {
  if (values.length === 0) {
    return undefined;
  }
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
};

const summarizeMethod = (
  playMethod: string,
  methodReviews: GameReview[],
): PlayMethodSummary => {
  const best = methodReviews.reduce((winner, review) =>
    (PERFORMANCE_RANK[review.performance] ?? 0) >
    (PERFORMANCE_RANK[winner.performance] ?? 0)
      ? review
      : winner,
  );

  return {
    playMethod,
    reportCount: methodReviews.length,
    bestPerformance: best.performance,
    medianFps: medianOf(
      methodReviews
        .map((review) => review.fps)
        .filter((fps): fps is number => fps !== null),
    ),
  };
};

export const buildMacVerdict = (reviews: GameReview[]): MacVerdict => {
  if (reviews.length === 0) {
    return { confidence: 'none' };
  }

  const byMethod = new Map<string, GameReview[]>();
  for (const review of reviews) {
    byMethod.set(review.playMethod, [
      ...(byMethod.get(review.playMethod) ?? []),
      review,
    ]);
  }

  const methods = [...byMethod.entries()]
    .map(([playMethod, methodReviews]) =>
      summarizeMethod(playMethod, methodReviews),
    )
    .sort((first, second) => second.reportCount - first.reportCount);

  const chips = [...new Set(reviews.map(formatChip))].sort();
  const fpsCoverage =
    reviews.filter((review) => review.fps !== null).length / reviews.length;

  if (reviews.length < MIN_REPORTS_FOR_CONFIDENCE) {
    return {
      confidence: 'thin',
      thinReason: 'tooFewReports',
      reportCount: reviews.length,
      methods,
      chips,
    };
  }

  if (fpsCoverage < MIN_FPS_COVERAGE) {
    return {
      confidence: 'thin',
      thinReason: 'missingSpecs',
      reportCount: reviews.length,
      methods,
      chips,
    };
  }

  return {
    confidence: 'confident',
    reportCount: reviews.length,
    methods,
    chips,
  };
};
