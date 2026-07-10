import { describe, it, expect } from 'vitest';
import { slugifyGameName } from '../slugify-game-name.util';

describe('slugifyGameName', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugifyGameName('Baldurs Gate')).toBe('baldurs-gate');
  });

  it('strips diacritics', () => {
    expect(slugifyGameName('Pokémon Café')).toBe('pokemon-cafe');
    expect(slugifyGameName('Créà')).toBe('crea');
  });

  it('removes trademark, registered and copyright symbols', () => {
    expect(slugifyGameName('Halo™')).toBe('halo');
    expect(slugifyGameName('Command & Conquer®')).toBe('command-conquer');
    expect(slugifyGameName('Something©')).toBe('something');
  });

  it('collapses runs of non-alphanumeric characters into a single hyphen', () => {
    expect(slugifyGameName('S.T.A.L.K.E.R.  2')).toBe('s-t-a-l-k-e-r-2');
    expect(slugifyGameName('Half-Life: Alyx')).toBe('half-life-alyx');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugifyGameName('  ...Hello World!!!  ')).toBe('hello-world');
  });

  it('returns empty string for purely numeric names', () => {
    expect(slugifyGameName('1979')).toBe('');
    expect(slugifyGameName('2077')).toBe('');
  });

  it('returns empty string when nothing alphanumeric remains', () => {
    expect(slugifyGameName('™®©')).toBe('');
    expect(slugifyGameName('   ')).toBe('');
  });

  it('keeps alphanumeric slugs that merely contain digits', () => {
    expect(slugifyGameName('Cyberpunk 2077')).toBe('cyberpunk-2077');
  });
});
