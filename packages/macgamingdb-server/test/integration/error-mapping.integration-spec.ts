import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createTestApp,
  seedBaseline,
  type TestApp,
} from '../utils/create-test-app.util';

const REPORT_RATE_LIMIT = 10;

describe('domain exception to trpc code mapping', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = await createTestApp();
    await seedBaseline(app.db);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should map a not-found domain code to NOT_FOUND', async () => {
    await expect(
      app.caller.review.updateReview({
        reviewId: 'review_does_not_exist',
        notes: 'anything',
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('should map a forbidden domain code to FORBIDDEN', async () => {
    const created = await app.caller.review.create({
      gameId: 'game_hades',
      playMethod: 'NATIVE',
      performance: 'GOOD',
      graphicsSettings: 'MEDIUM',
      macConfigIdentifier: 'MacBookPro18,1',
    });

    app.signInAs('user_someone_else');

    await expect(
      app.caller.review.updateReview({
        reviewId: created!.review.id,
        notes: 'anything',
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('should map a rate-limit domain code to TOO_MANY_REQUESTS', async () => {
    const created = await app.caller.review.create({
      gameId: 'game_hades',
      playMethod: 'NATIVE',
      performance: 'GOOD',
      graphicsSettings: 'MEDIUM',
      macConfigIdentifier: 'MacBookPro18,1',
    });
    const reviewId = created!.review.id;

    for (let attempt = 0; attempt < REPORT_RATE_LIMIT; attempt += 1) {
      await app.caller.report.create({ reviewId });
    }

    await expect(app.caller.report.create({ reviewId })).rejects.toMatchObject({
      code: 'TOO_MANY_REQUESTS',
    });
  });

  it('should surface the user friendly message rather than the technical one', async () => {
    const created = await app.caller.review.create({
      gameId: 'game_hades',
      playMethod: 'NATIVE',
      performance: 'GOOD',
      graphicsSettings: 'MEDIUM',
      macConfigIdentifier: 'MacBookPro18,1',
    });
    const reviewId = created!.review.id;

    for (let attempt = 0; attempt < REPORT_RATE_LIMIT; attempt += 1) {
      await app.caller.report.create({ reviewId });
    }

    await expect(app.caller.report.create({ reviewId })).rejects.toMatchObject({
      message: 'You are reporting too quickly. Please try again later.',
    });
  });
});
