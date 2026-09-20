import { describe, expect, it } from 'vitest';

import { buildGamePageTitle } from '../buildGamePageTitle';

const MAX_TITLE_LENGTH = 60;

describe('buildGamePageTitle', () => {
  it('should use the full suffix when the name is short', () => {
    expect(buildGamePageTitle('Hades II')).toBe(
      'Hades II on Mac – Apple Silicon FPS',
    );
  });

  it('should drop to the short suffix when the full one would overflow', () => {
    const title = buildGamePageTitle(
      'The Elder Scrolls IV: Oblivion Remastered',
    );
    expect(title).toBe('The Elder Scrolls IV: Oblivion Remastered on Mac');
    expect(title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
  });

  it('should truncate the name when even the short suffix would overflow', () => {
    const title = buildGamePageTitle(
      'A Ridiculously Long Game Name That Will Never Fit In A Title Tag',
    );
    expect(title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
    expect(title.endsWith('… on Mac')).toBe(true);
  });

  it('should never exceed the maximum length for any input', () => {
    const names = [
      'Hades II',
      'Red Dead Redemption 2',
      'Marvel’s Spider-Man Remastered',
      'The Elder Scrolls IV: Oblivion Remastered',
      'Sid Meier’s Civilization VI: Gathering Storm Deluxe Anthology Edition',
    ];
    names.forEach((name) => {
      expect(buildGamePageTitle(name).length).toBeLessThanOrEqual(
        MAX_TITLE_LENGTH,
      );
    });
  });

  it('should not leave a trailing space before the ellipsis', () => {
    expect(buildGamePageTitle('Word '.repeat(30))).not.toContain(' … on Mac');
  });
});
