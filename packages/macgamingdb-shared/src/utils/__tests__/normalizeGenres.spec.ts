import { describe, expect, it } from 'vitest';

import { normalizeGenres } from '../normalizeGenres';

describe('normalizeGenres', () => {
  it('should pass through canonical genres when already clean', () => {
    expect(normalizeGenres(['Action', 'Adventure'])).toEqual([
      'Action',
      'Adventure',
    ]);
  });

  it('should collapse localized labels onto their canonical genre', () => {
    expect(normalizeGenres(['Azione', 'Ação', 'Экшены'])).toEqual(['Action']);
    expect(normalizeGenres(['Simulazione', '시뮬레이션'])).toEqual([
      'Simulation',
    ]);
    expect(normalizeGenres(['인디'])).toEqual(['Indie']);
  });

  it('should collapse vocabulary duplicates onto one canonical genre', () => {
    expect(normalizeGenres(['Simulation', 'Simulator'])).toEqual([
      'Simulation',
    ]);
    expect(normalizeGenres(['RPG', 'Role-playing (RPG)', 'GDR'])).toEqual([
      'RPG',
    ]);
    expect(normalizeGenres(['Massively Multiplayer'])).toEqual(['MMO']);
  });

  it('should drop storefront labels that are not genres', () => {
    expect(normalizeGenres(['Free To Play', 'Early Access', 'Utilities'])).toEqual(
      [],
    );
    expect(normalizeGenres(['Action', 'Early Access'])).toEqual(['Action']);
  });

  it('should drop unknown labels rather than inventing a genre', () => {
    expect(normalizeGenres(['Blockchain Nonsense'])).toEqual([]);
  });

  it('should deduplicate and sort the result', () => {
    expect(normalizeGenres(['Strategy', 'Azione', 'Action', 'Strategia'])).toEqual(
      ['Action', 'Strategy'],
    );
  });

  it('should return an empty array when given no genres', () => {
    expect(normalizeGenres([])).toEqual([]);
  });

  it('should ignore whitespace and casing', () => {
    expect(normalizeGenres(['  aCTION  ', 'rpg'])).toEqual(['Action', 'RPG']);
  });
});
