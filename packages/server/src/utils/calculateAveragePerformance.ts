import {
  type GameReview,
  type PerformanceRating,
} from '../generated/prisma/client';

export const calculateAveragePerformance = (
  reviews: Pick<GameReview, 'performance'>[],
): number => {
  const performanceMap: Record<PerformanceRating, number> = {
    UNPLAYABLE: 0,
    BARELY_PLAYABLE: 1,
    PLAYABLE: 2,
    GOOD: 3,
    VERY_GOOD: 4,
    EXCELLENT: 5,
  };

  const sum = reviews.reduce((acc, review) => {
    return (
      acc + performanceMap[review.performance as keyof typeof performanceMap]
    );
  }, 0);

  return reviews.length > 0 ? sum / reviews.length : 0;
};
