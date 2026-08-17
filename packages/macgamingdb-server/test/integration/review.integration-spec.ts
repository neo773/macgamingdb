import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { gameReviews, games } from '../../src/database/schema';
import {
  createTestApp,
  seedBaseline,
  type TestApp,
} from '../utils/create-test-app.util';

describe('review api', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = await createTestApp();
    await seedBaseline(app.db);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should persist a review when an authenticated user creates one', async () => {
    const result = await app.caller.review.create({
      gameId: 'game_hades',
      playMethod: 'NATIVE',
      performance: 'EXCELLENT',
      graphicsSettings: 'HIGH',
      macConfigIdentifier: 'MacBookPro18,1',
      notes: 'Runs beautifully at 120fps.',
    });

    expect(result?.review.gameId).toBe('game_hades');

    const stored = await app.db.query.gameReviews.findMany({
      where: eq(gameReviews.gameId, 'game_hades'),
    });

    expect(stored).toHaveLength(1);
    expect(stored[0].chipset).toBe('M4');
    expect(stored[0].chipsetVariant).toBe('PRO');
  });

  it('should increment the game review count when a review is created', async () => {
    await app.caller.review.create({
      gameId: 'game_hades',
      playMethod: 'NATIVE',
      performance: 'GOOD',
      graphicsSettings: 'MEDIUM',
      macConfigIdentifier: 'MacBookPro18,1',
    });

    const game = await app.db.query.games.findFirst({
      where: eq(games.id, 'game_hades'),
    });

    expect(game?.reviewCount).toBe(1);
  });

  it('should reject the update when the review belongs to another user', async () => {
    const created = await app.caller.review.create({
      gameId: 'game_hades',
      playMethod: 'NATIVE',
      performance: 'GOOD',
      graphicsSettings: 'MEDIUM',
      macConfigIdentifier: 'MacBookPro18,1',
      notes: 'Original notes.',
    });

    app.signInAs('user_someone_else');

    await expect(
      app.caller.review.updateReview({
        reviewId: created!.review.id,
        notes: 'Hijacked notes.',
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    const stored = await app.db.query.gameReviews.findFirst({
      where: eq(gameReviews.id, created!.review.id),
    });

    expect(stored?.notes).toBe('Original notes.');
  });

  it('should reject the delete when the review belongs to another user', async () => {
    const created = await app.caller.review.create({
      gameId: 'game_hades',
      playMethod: 'NATIVE',
      performance: 'GOOD',
      graphicsSettings: 'MEDIUM',
      macConfigIdentifier: 'MacBookPro18,1',
    });

    app.signInAs('user_someone_else');

    await expect(
      app.caller.review.deleteReview({
        reviewId: created!.review.id,
        confirmation: true,
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    const stored = await app.db.query.gameReviews.findMany();
    expect(stored).toHaveLength(1);
  });

  it('should return only the signed-in users reviews from listMine', async () => {
    await app.caller.review.create({
      gameId: 'game_hades',
      playMethod: 'NATIVE',
      performance: 'GOOD',
      graphicsSettings: 'MEDIUM',
      macConfigIdentifier: 'MacBookPro18,1',
    });

    app.signInAs('user_someone_else');
    const otherUsersReviews = await app.caller.review.listMine();

    expect(otherUsersReviews).toHaveLength(0);
  });

  it('should reject the request when the caller is not signed in', async () => {
    app.signInAs(null);

    await expect(
      app.caller.review.create({
        gameId: 'game_hades',
        playMethod: 'NATIVE',
        performance: 'GOOD',
        graphicsSettings: 'MEDIUM',
        macConfigIdentifier: 'MacBookPro18,1',
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});
