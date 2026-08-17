import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { gameReviews } from '../../src/database/schema';
import {
  createTestApp,
  seedBaseline,
  type TestApp,
} from '../utils/create-test-app.util';
import { waitFor } from '../utils/wait-for.util';

const createReview = (app: TestApp, notes = 'Runs great on my M4 Pro.') =>
  app.caller.review.create({
    gameId: 'game_hades',
    playMethod: 'NATIVE',
    performance: 'EXCELLENT',
    graphicsSettings: 'HIGH',
    macConfigIdentifier: 'MacBookPro18,1',
    notes,
  });

describe('moderation api', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = await createTestApp();
    await seedBaseline(app.db);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should post a moderation alert when auto-screening flags a new review', async () => {
    app.moderationLlm.setVerdict({
      verdict: 'flag',
      category: 'spam',
      confidence: 0.95,
      rationale: 'Looks like advertising.',
    });

    await createReview(app, 'BUY CHEAP KEYS AT example.test');

    await waitFor(() => app.discord.alerts.length > 0, {
      description: 'an auto-moderation alert',
    });

    expect(app.discord.alerts[0].reporterName).toBe('Auto-moderation');
    expect(app.discord.alerts[0].verdict.verdict).toBe('flag');
  });

  it('should not post an alert when auto-screening clears a new review', async () => {
    await createReview(app);

    await waitFor(() => app.moderationLlm.calls.length > 0, {
      description: 'the moderation llm to be consulted',
    });

    expect(app.discord.alerts).toHaveLength(0);
  });

  it('should post a moderation alert when a user reports a review', async () => {
    const created = await createReview(app);
    const reviewId = created!.review.id;

    await waitFor(() => app.moderationLlm.calls.length > 0, {
      description: 'auto-screening to finish',
    });

    app.moderationLlm.setVerdict({
      verdict: 'flag',
      category: 'inaccurate',
      confidence: 0.8,
      rationale: 'Performance claim is impossible.',
    });

    await app.caller.report.create({ reviewId, reason: 'fake' });

    await waitFor(() => app.discord.alerts.length > 0, {
      description: 'a report-driven moderation alert',
    });

    expect(app.discord.alerts[0].reportReason).toBe('fake');
  });

  it('should increment the report count when a review is reported', async () => {
    const created = await createReview(app);
    const reviewId = created!.review.id;

    await app.caller.report.create({ reviewId });

    const stored = await app.db.query.gameReviews.findFirst({
      where: eq(gameReviews.id, reviewId),
    });

    expect(stored?.reportCount).toBe(1);
  });

  it('should announce a failure alert when the moderation llm throws', async () => {
    app.moderationLlm.setFailure(new Error('OpenRouter is down'));

    await createReview(app);

    await waitFor(() => app.discord.failureAlerts.length > 0, {
      description: 'a moderation failure alert',
    });

    expect(app.discord.failureAlerts[0].stage).toBe('judge');
    expect(app.discord.failureAlerts[0].failureMessage).toBe(
      'OpenRouter is down',
    );
  });

  it('should release the alert claim when posting the alert fails', async () => {
    app.moderationLlm.setVerdict({
      verdict: 'flag',
      category: 'spam',
      confidence: 0.95,
      rationale: 'Looks like advertising.',
    });
    app.discord.setFailure(new Error('Discord is down'));

    const created = await createReview(app);
    const reviewId = created!.review.id;

    await waitFor(() => app.discord.failureAlerts.length > 0, {
      description: 'a dispatch failure alert',
    });

    expect(app.discord.failureAlerts[0].stage).toBe('dispatch');

    const stored = await app.db.query.gameReviews.findFirst({
      where: eq(gameReviews.id, reviewId),
    });

    expect(stored?.moderationAlertedAt).toBeNull();
  });

  it('should not alert twice when the same review is reported repeatedly', async () => {
    const created = await createReview(app);
    const reviewId = created!.review.id;

    app.moderationLlm.setVerdict({
      verdict: 'flag',
      category: 'spam',
      confidence: 0.9,
      rationale: 'Spam.',
    });

    await app.caller.report.create({ reviewId });
    await waitFor(() => app.discord.alerts.length > 0, {
      description: 'the first moderation alert',
    });

    await app.caller.report.create({ reviewId });

    expect(app.discord.alerts).toHaveLength(1);
  });
});
