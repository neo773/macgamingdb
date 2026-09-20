import { describe, expect, it } from 'vitest';

import { extractIgdbCriticRating } from '../extract-igdb-critic-rating.util';

describe('extractIgdbCriticRating', () => {
  it('should round the rating and keep the count when critics exist', () => {
    expect(
      extractIgdbCriticRating({
        aggregated_rating: 87.6421,
        aggregated_rating_count: 12,
      }),
    ).toEqual({ criticRating: 88, criticRatingCount: 12 });
  });

  it('should return null when no critic has scored the game', () => {
    expect(
      extractIgdbCriticRating({
        aggregated_rating: 91,
        aggregated_rating_count: 0,
      }),
    ).toEqual({ criticRating: null, criticRatingCount: null });
  });

  it('should return null when the count is missing', () => {
    expect(extractIgdbCriticRating({ aggregated_rating: 91 })).toEqual({
      criticRating: null,
      criticRatingCount: null,
    });
  });

  it('should return null when the rating is missing', () => {
    expect(extractIgdbCriticRating({ aggregated_rating_count: 5 })).toEqual({
      criticRating: null,
      criticRatingCount: null,
    });
  });

  it('should return null when the payload carries neither field', () => {
    expect(extractIgdbCriticRating({})).toEqual({
      criticRating: null,
      criticRatingCount: null,
    });
  });

  it('should keep a legitimate zero rating when a critic scored it', () => {
    expect(
      extractIgdbCriticRating({
        aggregated_rating: 0,
        aggregated_rating_count: 1,
      }),
    ).toEqual({ criticRating: 0, criticRatingCount: 1 });
  });
});
