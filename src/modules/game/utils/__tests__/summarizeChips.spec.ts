import { describe, expect, it } from 'vitest';

import { summarizeChips } from '../summarizeChips';

describe('summarizeChips', () => {
  it('should list the chips when there are few enough to read', () => {
    expect(summarizeChips(['M1', 'M4 Pro'])).toBe('M1, M4 Pro');
  });

  it('should list exactly four chips without collapsing', () => {
    expect(summarizeChips(['M1', 'M2', 'M3', 'M4'])).toBe('M1, M2, M3, M4');
  });

  it('should collapse a long list to a generation range', () => {
    expect(
      summarizeChips(['M1', 'M1 Max', 'M2', 'M3 Pro', 'M4', 'M5 Max']),
    ).toBe('M1 to M5');
  });

  it('should describe variants when every chip is one generation', () => {
    expect(summarizeChips(['M4', 'M4 Max', 'M4 Pro', 'M4 Ultra', 'M4'])).toBe(
      'M4 variants',
    );
  });

  it('should return an empty string for no chips', () => {
    expect(summarizeChips([])).toBe('');
  });
});
