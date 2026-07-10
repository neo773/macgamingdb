import { describe, it, expect } from 'vitest';
import { extractReleaseYear } from '../extract-release-year.util';

describe('extractReleaseYear', () => {
  it('extracts the year from Steam date formats', () => {
    expect(extractReleaseYear('12 Sep, 2023')).toBe(2023);
    expect(extractReleaseYear('Sep 2023')).toBe(2023);
    expect(extractReleaseYear('2023')).toBe(2023);
  });

  it('extracts years from the 1900s', () => {
    expect(extractReleaseYear('31 Dec, 1996')).toBe(1996);
  });

  it('returns undefined when no year is present', () => {
    expect(extractReleaseYear('Coming soon')).toBeUndefined();
    expect(extractReleaseYear('')).toBeUndefined();
    expect(extractReleaseYear(null)).toBeUndefined();
    expect(extractReleaseYear(undefined)).toBeUndefined();
  });

  it('ignores numbers that are not plausible years', () => {
    expect(extractReleaseYear('Q4 2166')).toBeUndefined();
    expect(extractReleaseYear('1234')).toBeUndefined();
  });
});
