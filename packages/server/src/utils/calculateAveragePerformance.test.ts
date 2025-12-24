import { describe, it, expect } from 'vitest';
import { calculateAveragePerformance } from './calculateAveragePerformance';
import type { PerformanceRating } from '../generated/prisma/client';

describe('calculateAveragePerformance', () => {
  it('returns 0 for empty reviews array', () => {
    expect(calculateAveragePerformance([])).toBe(0);
  });

  it('returns correct average for single review', () => {
    expect(
      calculateAveragePerformance([
        { performance: 'EXCELLENT' as PerformanceRating },
      ]),
    ).toBe(5);
    expect(
      calculateAveragePerformance([
        { performance: 'UNPLAYABLE' as PerformanceRating },
      ]),
    ).toBe(0);
  });

  it('calculates correct average for multiple reviews', () => {
    const reviews: { performance: PerformanceRating }[] = [
      { performance: 'EXCELLENT' },
      { performance: 'GOOD' },
    ];
    expect(calculateAveragePerformance(reviews)).toBe(4);
  });

  it('handles all performance ratings correctly', () => {
    const reviews: { performance: PerformanceRating }[] = [
      { performance: 'UNPLAYABLE' },
      { performance: 'BARELY_PLAYABLE' },
      { performance: 'PLAYABLE' },
      { performance: 'GOOD' },
      { performance: 'VERY_GOOD' },
      { performance: 'EXCELLENT' },
    ];
    expect(calculateAveragePerformance(reviews)).toBe(2.5);
  });
});
