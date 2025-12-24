import { type Performance } from '../schema';

export const scoreToRating = (score: number): Performance => {
  if (score >= 4.5) return 'EXCELLENT';
  if (score >= 3.5) return 'VERY_GOOD';
  if (score >= 2.5) return 'GOOD';
  if (score >= 1.5) return 'PLAYABLE';
  if (score >= 0.5) return 'BARELY_PLAYABLE';
  return 'UNPLAYABLE';
};
