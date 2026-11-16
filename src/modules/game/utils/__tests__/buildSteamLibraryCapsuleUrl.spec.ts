import { describe, expect, it } from 'vitest';

import { buildSteamLibraryCapsuleUrl } from '../buildSteamLibraryCapsuleUrl';

describe('buildSteamLibraryCapsuleUrl', () => {
  it('should build the library capsule url when the game has a Steam link', () => {
    const sourceLinks = [
      { source: 'igdb' as const, externalId: '1020' },
      { source: 'steam' as const, externalId: '1174180' },
    ];

    const url = buildSteamLibraryCapsuleUrl({ sourceLinks });

    expect(url).toBe(
      'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg',
    );
  });

  it('should return nothing when the game has no Steam link', () => {
    const sourceLinks = [{ source: 'igdb' as const, externalId: '1020' }];

    const url = buildSteamLibraryCapsuleUrl({ sourceLinks });

    expect(url).toBeUndefined();
  });
});
