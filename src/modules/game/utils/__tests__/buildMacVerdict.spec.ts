import { describe, expect, it } from 'vitest';

import { buildMacVerdict } from '../buildMacVerdict';

type TestReview = Parameters<typeof buildMacVerdict>[0][number];

const createTestReview = (overrides: Partial<TestReview> = {}): TestReview => ({
  playMethod: 'CROSSOVER',
  performance: 'GOOD',
  fps: 60,
  chipset: 'M4',
  chipsetVariant: 'BASE',
  ...overrides,
});

describe('buildMacVerdict', () => {
  it('should report no confidence when there are no reports', () => {
    expect(buildMacVerdict([])).toEqual({ confidence: 'none' });
  });

  it('should be thin when there are fewer than three reports', () => {
    const verdict = buildMacVerdict([createTestReview(), createTestReview()]);
    expect(verdict).toMatchObject({ confidence: 'thin', reportCount: 2 });
  });

  it('should be confident with three reports that record fps', () => {
    const verdict = buildMacVerdict([
      createTestReview({ fps: 55 }),
      createTestReview({ fps: 60 }),
      createTestReview({ fps: 65 }),
    ]);
    expect(verdict).toMatchObject({ confidence: 'confident', reportCount: 3 });
  });

  it('should stay thin when most reports have no fps recorded', () => {
    const verdict = buildMacVerdict([
      createTestReview({ fps: 60 }),
      createTestReview({ fps: null }),
      createTestReview({ fps: null }),
      createTestReview({ fps: null }),
    ]);
    expect(verdict).toMatchObject({ confidence: 'thin' });
  });

  it('should pick the best performance seen per play method', () => {
    const verdict = buildMacVerdict([
      createTestReview({ performance: 'PLAYABLE' }),
      createTestReview({ performance: 'EXCELLENT' }),
      createTestReview({ performance: 'GOOD' }),
    ]);
    expect(verdict).toMatchObject({
      methods: [{ playMethod: 'CROSSOVER', bestPerformance: 'EXCELLENT' }],
    });
  });

  it('should compute the median fps rather than the mean', () => {
    const verdict = buildMacVerdict([
      createTestReview({ fps: 10 }),
      createTestReview({ fps: 60 }),
      createTestReview({ fps: 200 }),
    ]);
    expect(verdict).toMatchObject({ methods: [{ medianFps: 60 }] });
  });

  it('should group by play method and order by report count', () => {
    const verdict = buildMacVerdict([
      createTestReview({ playMethod: 'NATIVE' }),
      createTestReview({ playMethod: 'CROSSOVER' }),
      createTestReview({ playMethod: 'CROSSOVER' }),
    ]);
    expect(verdict).toMatchObject({
      methods: [
        { playMethod: 'CROSSOVER', reportCount: 2 },
        { playMethod: 'NATIVE', reportCount: 1 },
      ],
    });
  });

  it('should format chip names and drop the BASE suffix', () => {
    const verdict = buildMacVerdict([
      createTestReview({ chipset: 'M1', chipsetVariant: 'BASE' }),
      createTestReview({ chipset: 'M4', chipsetVariant: 'PRO' }),
      createTestReview({ chipset: 'M4', chipsetVariant: 'PRO' }),
    ]);
    expect(verdict).toMatchObject({ chips: ['M1', 'M4 Pro'] });
  });

  it('should never claim a play method that has no reports behind it', () => {
    const verdict = buildMacVerdict([
      createTestReview({ playMethod: 'CROSSOVER' }),
      createTestReview({ playMethod: 'CROSSOVER' }),
      createTestReview({ playMethod: 'CROSSOVER' }),
    ]);
    expect(verdict).toMatchObject({ methods: [{ playMethod: 'CROSSOVER' }] });
    if (verdict.confidence === 'none') throw new Error('unexpected');
    expect(verdict.methods).toHaveLength(1);
  });
});
