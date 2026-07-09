import { describe, it, expect } from 'vitest';
import { formatRatingLabel } from './formatRatingLabel';

describe('formatRatingLabel', () => {
  it('formats ALL as "All Games"', () => {
    expect(formatRatingLabel('ALL')).toBe('All Games');
  });

  it('formats EXCELLENT as "Excellent"', () => {
    expect(formatRatingLabel('EXCELLENT')).toBe('Excellent');
  });

  it('formats VERY_GOOD as "Very Good"', () => {
    expect(formatRatingLabel('VERY_GOOD')).toBe('Very Good');
  });

  it('formats GOOD as "Good"', () => {
    expect(formatRatingLabel('GOOD')).toBe('Good');
  });

  it('formats PLAYABLE as "Playable"', () => {
    expect(formatRatingLabel('PLAYABLE')).toBe('Playable');
  });

  it('formats BARELY_PLAYABLE as "Barely Playable"', () => {
    expect(formatRatingLabel('BARELY_PLAYABLE')).toBe('Barely Playable');
  });

  it('formats UNPLAYABLE as "Unplayable"', () => {
    expect(formatRatingLabel('UNPLAYABLE')).toBe('Unplayable');
  });
});
