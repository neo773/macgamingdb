import { describe, it, expect } from 'vitest';
import { scoreToRating } from './scoreToRating';

describe('scoreToRating', () => {
  it('returns EXCELLENT for scores >= 4.5', () => {
    expect(scoreToRating(4.5)).toBe('EXCELLENT');
    expect(scoreToRating(5)).toBe('EXCELLENT');
  });

  it('returns VERY_GOOD for scores >= 3.5 and < 4.5', () => {
    expect(scoreToRating(3.5)).toBe('VERY_GOOD');
    expect(scoreToRating(4.49)).toBe('VERY_GOOD');
  });

  it('returns GOOD for scores >= 2.5 and < 3.5', () => {
    expect(scoreToRating(2.5)).toBe('GOOD');
    expect(scoreToRating(3.49)).toBe('GOOD');
  });

  it('returns PLAYABLE for scores >= 1.5 and < 2.5', () => {
    expect(scoreToRating(1.5)).toBe('PLAYABLE');
    expect(scoreToRating(2.49)).toBe('PLAYABLE');
  });

  it('returns BARELY_PLAYABLE for scores >= 0.5 and < 1.5', () => {
    expect(scoreToRating(0.5)).toBe('BARELY_PLAYABLE');
    expect(scoreToRating(1.49)).toBe('BARELY_PLAYABLE');
  });

  it('returns UNPLAYABLE for scores < 0.5', () => {
    expect(scoreToRating(0)).toBe('UNPLAYABLE');
    expect(scoreToRating(0.49)).toBe('UNPLAYABLE');
  });
});
