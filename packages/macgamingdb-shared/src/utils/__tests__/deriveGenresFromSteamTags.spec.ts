import { describe, expect, it } from 'vitest';

import { deriveGenresFromSteamTags } from '../deriveGenresFromSteamTags';

describe('deriveGenresFromSteamTags', () => {
  it('should map genre-like tags onto canonical genres when they are strongly voted', () => {
    const tagVotes = {
      FPS: 1160,
      Shooter: 834,
      Multiplayer: 795,
      Action: 603,
    };

    const genres = deriveGenresFromSteamTags({ tagVotes });

    expect(genres).toEqual(['Action', 'Shooter']);
  });

  it('should ignore genre tags when they are weakly voted', () => {
    const tagVotes = {
      Cyberpunk: 873,
      RPG: 670,
      FPS: 595,
      Strategy: 300,
    };

    const genres = deriveGenresFromSteamTags({ tagVotes });

    expect(genres).toEqual(['RPG', 'Shooter']);
  });

  it('should collapse several tags onto one genre when they share it', () => {
    const tagVotes = {
      Puzzle: 586,
      'Puzzle Platformer': 549,
      Logic: 500,
    };

    const genres = deriveGenresFromSteamTags({ tagVotes });

    expect(genres).toEqual(['Puzzle']);
  });

  it('should return no genres when no tag maps to a genre', () => {
    const tagVotes = {
      Automation: 900,
      'Base Building': 800,
    };

    const genres = deriveGenresFromSteamTags({ tagVotes });

    expect(genres).toEqual([]);
  });

  it('should return no genres when there are no tags', () => {
    const genres = deriveGenresFromSteamTags({ tagVotes: {} });

    expect(genres).toEqual([]);
  });
});
