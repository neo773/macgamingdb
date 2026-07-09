import { describe, it, expect } from 'vitest';
import { generateUniqueGameSlug } from './generateUniqueGameSlug';

describe('generateUniqueGameSlug', () => {
  const neverTaken = async () => false;

  it('returns the base slug when available', async () => {
    const slug = await generateUniqueGameSlug('Portal 2', {
      fallbackId: '620',
      isTaken: neverTaken,
    });
    expect(slug).toBe('portal-2');
  });

  it('appends the release year when the base slug is taken', async () => {
    const takenSlugs = new Set(['doom']);
    const slug = await generateUniqueGameSlug('Doom', {
      releaseYear: 2016,
      fallbackId: '379720',
      isTaken: async (candidate) => takenSlugs.has(candidate),
    });
    expect(slug).toBe('doom-2016');
  });

  it('falls back to the id when base and year are taken', async () => {
    const takenSlugs = new Set(['doom', 'doom-2016']);
    const slug = await generateUniqueGameSlug('Doom', {
      releaseYear: 2016,
      fallbackId: '379720',
      isTaken: async (candidate) => takenSlugs.has(candidate),
    });
    expect(slug).toBe('doom-379720');
  });

  it('uses the game-{id} fallback for purely numeric names', async () => {
    const slug = await generateUniqueGameSlug('1979', {
      fallbackId: '456780',
      isTaken: neverTaken,
    });
    expect(slug).toBe('game-456780');
  });

  it('never returns a purely numeric slug even with a numeric fallback', async () => {
    const slug = await generateUniqueGameSlug('1979', {
      releaseYear: 1979,
      fallbackId: '1979',
      isTaken: neverTaken,
    });
    expect(slug).toBe('game-1979');
    expect(/^[0-9]+$/.test(slug)).toBe(false);
  });

  it('uses the game-{id} fallback when every named candidate is taken', async () => {
    const slug = await generateUniqueGameSlug('Tetris', {
      releaseYear: 1984,
      fallbackId: '12345',
      isTaken: async (candidate) => candidate !== 'game-12345',
    });
    expect(slug).toBe('game-12345');
  });
});
