import { describe, it, expect } from 'vitest';
import { getChipsetCombinations } from './getChipsetCombinations';

describe('getChipsetCombinations', () => {
  it('returns all chipset and variant combinations', () => {
    const combinations = getChipsetCombinations();

    expect(combinations).toHaveLength(20);
  });

  it('formats BASE variant labels without suffix', () => {
    const combinations = getChipsetCombinations();
    const m1Base = combinations.find(c => c.value === 'M1-BASE');

    expect(m1Base).toBeDefined();
    expect(m1Base?.label).toBe('M1');
  });

  it('formats non-BASE variant labels with suffix', () => {
    const combinations = getChipsetCombinations();
    const m1Pro = combinations.find(c => c.value === 'M1-PRO');
    const m3Max = combinations.find(c => c.value === 'M3-MAX');

    expect(m1Pro?.label).toBe('M1 PRO');
    expect(m3Max?.label).toBe('M3 MAX');
  });

  it('includes all chipset generations', () => {
    const combinations = getChipsetCombinations();
    const chipsets = ['M1', 'M2', 'M3', 'M4', 'M5'];

    for (const chipset of chipsets) {
      const hasChipset = combinations.some(c => c.value.startsWith(chipset));
      expect(hasChipset).toBe(true);
    }
  });
});
