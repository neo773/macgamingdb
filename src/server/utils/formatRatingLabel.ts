import { type Performance } from '@/server/schema';

export type PerformanceLabel = Performance & 'ALL';

export const formatRatingLabel = (rating: PerformanceLabel) => {
  switch (rating) {
    case 'ALL':
      return 'All Games';
    case 'EXCELLENT':
      return 'Excellent';
    case 'GOOD':
      return 'Good';
    case 'BARELY_PLAYABLE':
      return 'Barely Playable';
    case 'PLAYABLE':
      return 'Playable';
    case 'UNPLAYABLE':
      return 'Unplayable';
    case 'VERY_GOOD':
      return 'Very Good';
    default:
      return rating;
  }
};
