import { describe, expect, it } from 'vitest';
import { SearchURLParamsKeys } from '@/modules/search/constants/SearchURLParamsKeys';
import { buildSearchQueryString } from '../buildSearchQueryString';

describe('buildSearchQueryString', () => {
  it('should return empty string when searchParams is undefined', () => {
    // Arrange
    const searchParams = undefined;

    // Act
    const result = buildSearchQueryString({ searchParams });

    // Assert
    expect(result).toBe('');
  });

  it('should return empty string when searchParams is empty', () => {
    // Arrange
    const searchParams = {};

    // Act
    const result = buildSearchQueryString({ searchParams });

    // Assert
    expect(result).toBe('');
  });

  it('should extract query when passed Record with q', () => {
    // Arrange
    const searchParams = { [SearchURLParamsKeys.QUERY]: 'cyberpunk' };

    // Act
    const result = buildSearchQueryString({ searchParams });

    // Assert
    expect(result).toBe('q=cyberpunk');
  });

  it('should extract allowed filter params and ignore disallowed keys', () => {
    // Arrange
    const searchParams = {
      [SearchURLParamsKeys.QUERY]: 'witcher',
      [SearchURLParamsKeys.CHIPSET]: 'm3',
      [SearchURLParamsKeys.GENRE]: 'Action',
      error: 'some_error',
      page: '2',
    };

    // Act
    const result = buildSearchQueryString({ searchParams });

    // Assert
    expect(result).toBe('q=witcher&chipset=m3&genre=Action');
  });

  it('should ignore empty string or whitespace values', () => {
    // Arrange
    const searchParams = {
      [SearchURLParamsKeys.QUERY]: '   ',
      [SearchURLParamsKeys.CHIPSET]: 'm1',
    };

    // Act
    const result = buildSearchQueryString({ searchParams });

    // Assert
    expect(result).toBe('chipset=m1');
  });

  it('should extract allowed params when passed URLSearchParams', () => {
    // Arrange
    const searchParams = new URLSearchParams(
      'q=resident+evil&chipset=m2&unknown=123',
    );

    // Act
    const result = buildSearchQueryString({ searchParams });

    // Assert
    expect(result).toBe('q=resident+evil&chipset=m2');
  });

  it('should support array values in Record', () => {
    // Arrange
    const searchParams = {
      [SearchURLParamsKeys.QUERY]: ['resident', 'evil'],
    };

    // Act
    const result = buildSearchQueryString({ searchParams });

    // Assert
    expect(result).toBe('q=resident&q=evil');
  });
});
