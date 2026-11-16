import { describe, expect, it } from 'vitest';

import { buildCrossOverPitch } from '../buildCrossOverPitch';

type TestReview = Parameters<typeof buildCrossOverPitch>[0]['reviews'][number];

const createTestReview = (overrides: Partial<TestReview> = {}): TestReview => ({
  playMethod: 'CROSSOVER',
  performance: 'GOOD',
  fps: 60,
  ...overrides,
});

describe('buildCrossOverPitch', () => {
  it('should return nothing when there are no CrossOver reports', () => {
    const reviews = [createTestReview({ playMethod: 'PARALLELS' })];

    const pitch = buildCrossOverPitch({ reviews });

    expect(pitch).toBeUndefined();
  });

  it('should return nothing when most CrossOver reports are not playable', () => {
    const reviews = [
      createTestReview({ performance: 'UNPLAYABLE' }),
      createTestReview({ performance: 'BARELY_PLAYABLE' }),
      createTestReview({ performance: 'GOOD' }),
    ];

    const pitch = buildCrossOverPitch({ reviews });

    expect(pitch).toBeUndefined();
  });

  it('should pitch when the game also has more native reports that run well', () => {
    const reviews = [
      createTestReview(),
      createTestReview({ playMethod: 'NATIVE', performance: 'EXCELLENT' }),
      createTestReview({ playMethod: 'NATIVE', performance: 'VERY_GOOD' }),
    ];

    const pitch = buildCrossOverPitch({ reviews });

    expect(pitch).toEqual({
      reportCount: 1,
      playableReportCount: 1,
      medianFps: 60,
    });
  });

  it('should count playable reports and take the median fps when CrossOver mostly works', () => {
    const reviews = [
      createTestReview({ fps: 30 }),
      createTestReview({ performance: 'PLAYABLE', fps: 45 }),
      createTestReview({ performance: 'UNPLAYABLE', fps: null }),
      createTestReview({ playMethod: 'PARALLELS', fps: 90 }),
    ];

    const pitch = buildCrossOverPitch({ reviews });

    expect(pitch).toEqual({
      reportCount: 3,
      playableReportCount: 2,
      medianFps: 38,
    });
  });
});
