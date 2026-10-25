import { describe, expect, it } from 'vitest';
import { SearchURLParamsKeys } from '@/modules/search/constants/SearchURLParamsKeys';
import { buildGameBackLink } from '../buildGameBackLink';

describe('buildGameBackLink', () => {
  it('should return Home link to "/" when searchParams is undefined', () => {
    // Arrange
    const searchParams = undefined;

    // Act
    const result = buildGameBackLink({ searchParams });

    // Assert
    expect(result).toEqual({
      href: '/',
      label: 'Home',
    });
  });

  it('should return Home link to "/" when searchParams has no valid search keys', () => {
    // Arrange
    const searchParams = { error: 'invalid', tab: 'reviews' };

    // Act
    const result = buildGameBackLink({ searchParams });

    // Assert
    expect(result).toEqual({
      href: '/',
      label: 'Home',
    });
  });

  it('should return "Back to search results" when search query q is present', () => {
    // Arrange
    const searchParams = { [SearchURLParamsKeys.QUERY]: 'witcher' };

    // Act
    const result = buildGameBackLink({ searchParams });

    // Assert
    expect(result).toEqual({
      href: '/?q=witcher',
      label: 'Back to search results',
    });
  });

  it('should return "Back to search results" with all search filters when q and filters are present', () => {
    // Arrange
    const searchParams = {
      [SearchURLParamsKeys.QUERY]: 'cyberpunk',
      [SearchURLParamsKeys.CHIPSET]: 'm3',
      [SearchURLParamsKeys.PERFORMANCE]: 'playable',
    };

    // Act
    const result = buildGameBackLink({ searchParams });

    // Assert
    expect(result).toEqual({
      href: '/?q=cyberpunk&chipset=m3&performance=playable',
      label: 'Back to search results',
    });
  });

  it('should return "Back to games" when only filter params are present', () => {
    // Arrange
    const searchParams = {
      [SearchURLParamsKeys.CHIPSET]: 'm2',
      [SearchURLParamsKeys.GENRE]: 'RPG',
    };

    // Act
    const result = buildGameBackLink({ searchParams });

    // Assert
    expect(result).toEqual({
      href: '/?chipset=m2&genre=RPG',
      label: 'Back to games',
    });
  });
});
