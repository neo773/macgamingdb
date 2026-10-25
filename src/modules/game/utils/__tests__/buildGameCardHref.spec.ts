import { describe, expect, it } from 'vitest';
import { SearchURLParamsKeys } from '@/modules/search/constants/SearchURLParamsKeys';
import { buildGameCardHref } from '../buildGameCardHref';

describe('buildGameCardHref', () => {
  it('should return base href when searchParams is undefined', () => {
    // Arrange
    const identifier = 'cyberpunk-2077';
    const searchParams = undefined;

    // Act
    const result = buildGameCardHref({ identifier, searchParams });

    // Assert
    expect(result).toBe('/games/cyberpunk-2077');
  });

  it('should return base href when searchParams has no valid search params', () => {
    // Arrange
    const identifier = 'cyberpunk-2077';
    const searchParams = { error: 'invalid' };

    // Act
    const result = buildGameCardHref({ identifier, searchParams });

    // Assert
    expect(result).toBe('/games/cyberpunk-2077');
  });

  it('should return href with query string when searchParams has search query', () => {
    // Arrange
    const identifier = 'cyberpunk-2077';
    const searchParams = { [SearchURLParamsKeys.QUERY]: 'cyber' };

    // Act
    const result = buildGameCardHref({ identifier, searchParams });

    // Assert
    expect(result).toBe('/games/cyberpunk-2077?q=cyber');
  });

  it('should return href with preserved params when searchParams is URLSearchParams', () => {
    // Arrange
    const identifier = 'hades';
    const searchParams = new URLSearchParams('q=hades&chipset=m3');

    // Act
    const result = buildGameCardHref({ identifier, searchParams });

    // Assert
    expect(result).toBe('/games/hades?q=hades&chipset=m3');
  });
});
