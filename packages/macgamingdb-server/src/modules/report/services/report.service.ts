import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { isNonEmptyString } from '@sniptt/guards';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { gameReviews, users } from '../../../database/schema';
import { deriveDisplayNameFromEmail } from '../../../engine/utils/derive-display-name-from-email.util';
import { MODERATION_LLM } from '../constants/moderation-llm.constant';
import { type ModerationLlm } from '../types/moderation-llm.type';
import { type ModerationVerdict } from '../dtos/moderation-verdict.dto';
import { type ReportReason } from '../dtos/report-reason.dto';
import { DiscordMessageService } from '../drivers/discord/services/discord-message.service';
import {
  REPORT_SUBMITTED_EVENT,
  type ReportSubmittedEvent,
} from '../events/report-submitted.event';
import { ReportException } from '../exceptions/report.exception';
import { buildReviewUrl } from '../utils/build-review-url.util';

type ReportReviewParams = {
  reporterUserId: string;
  reviewId: string;
  reason?: ReportReason;
  note?: string;
};

type ReviewWithGame = NonNullable<
  Awaited<ReturnType<ReportService['findReviewWithGame']>>
>;

const MAX_REPORTS_PER_WINDOW = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

@Injectable()
export class ReportService {
  private readonly reportTimestampsByUser = new Map<string, number[]>();

  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB,
    @Inject(MODERATION_LLM) private readonly moderationLlm: ModerationLlm,
    private readonly discordMessageService: DiscordMessageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async findReviewWithGame(reviewId: string) {
    return this.db.query.gameReviews.findFirst({
      where: eq(gameReviews.id, reviewId),
      with: { game: true },
    });
  }

  private assertWithinRateLimitOrThrow(userId: string): void {
    const now = Date.now();
    const recent = (this.reportTimestampsByUser.get(userId) ?? []).filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
    );

    if (recent.length >= MAX_REPORTS_PER_WINDOW) {
      throw new ReportException(
        'Report rate limit exceeded',
        'REPORT_TOO_MANY_REQUESTS',
        'You are reporting too quickly. Please try again later.',
      );
    }

    recent.push(now);
    this.reportTimestampsByUser.set(userId, recent);
  }

  async reportReview(params: ReportReviewParams) {
    this.assertWithinRateLimitOrThrow(params.reporterUserId);

    const review = await this.findReviewWithGame(params.reviewId);

    if (!review) {
      throw new ReportException('Review not found', 'REVIEW_NOT_FOUND');
    }

    await this.db
      .update(gameReviews)
      .set({
        reportCount: sql`${gameReviews.reportCount} + 1`,
        lastReportedAt: new Date().toISOString(),
      })
      .where(eq(gameReviews.id, params.reviewId));

    if (isDefined(review.hiddenAt)) {
      return { success: true, message: 'Report submitted' };
    }

    if (await this.claimAlert(params.reviewId)) {
      const event: ReportSubmittedEvent = {
        reviewId: params.reviewId,
        reporterUserId: params.reporterUserId,
        reason: params.reason,
      };
      this.eventEmitter.emit(REPORT_SUBMITTED_EVENT, event);
    }

    return { success: true, message: 'Report submitted' };
  }

  async handleReportSubmitted(event: ReportSubmittedEvent): Promise<void> {
    const review = await this.findReviewWithGame(event.reviewId);
    if (!review) {
      await this.releaseAlert(event.reviewId);
      return;
    }

    try {
      const verdict = await this.judgeReviewOrThrow(review, event.reason);
      const reporterName = await this.resolveReporterName(event.reporterUserId);
      await this.postModerationAlert(review, verdict, reporterName, event.reason);
    } catch (error) {
      console.error('Failed to dispatch moderation alert:', error);
      await this.releaseAlert(event.reviewId);
    }
  }

  async screenNewReview({ reviewId }: { reviewId: string }): Promise<void> {
    const review = await this.findReviewWithGame(reviewId);
    if (!review || isDefined(review.hiddenAt)) {
      return;
    }

    let verdict: ModerationVerdict;
    try {
      verdict = await this.judgeReviewOrThrow(review);
    } catch (error) {
      console.error('Failed to screen new review:', error);
      return;
    }

    if (verdict.verdict !== 'flag') {
      return;
    }

    if (!(await this.claimAlert(reviewId))) {
      return;
    }

    try {
      await this.postModerationAlert(review, verdict, 'Auto-moderation');
    } catch (error) {
      console.error('Failed to post auto-moderation alert:', error);
      await this.releaseAlert(reviewId);
    }
  }

  private async claimAlert(reviewId: string): Promise<boolean> {
    const [claimed] = await this.db
      .update(gameReviews)
      .set({ moderationAlertedAt: new Date().toISOString() })
      .where(
        and(
          eq(gameReviews.id, reviewId),
          isNull(gameReviews.moderationAlertedAt),
        ),
      )
      .returning({ id: gameReviews.id });
    return isDefined(claimed);
  }

  private async releaseAlert(reviewId: string): Promise<void> {
    await this.db
      .update(gameReviews)
      .set({ moderationAlertedAt: null })
      .where(eq(gameReviews.id, reviewId));
  }

  private async judgeReviewOrThrow(
    review: ReviewWithGame,
    reason?: ReportReason,
  ): Promise<ModerationVerdict> {
    return this.moderationLlm.judgeReview({
      game: {
        name: review.game.name ?? 'Unknown game',
        developers: review.game.developers ?? undefined,
        publishers: review.game.publishers ?? undefined,
        genres: review.game.genres ?? undefined,
        releaseYear: review.game.releaseYear ?? undefined,
        website: review.game.website ?? undefined,
      },
      review: {
        playMethod: review.playMethod,
        translationLayer: review.translationLayer ?? undefined,
        performance: review.performance,
        fps: review.fps ?? undefined,
        graphicsSettings: review.graphicsSettings ?? undefined,
        resolution: review.resolution ?? undefined,
        chipset: review.chipset,
        chipsetVariant: review.chipsetVariant,
        softwareVersion: review.softwareVersion ?? undefined,
        notes: review.notes ?? undefined,
      },
      reportReason: reason,
    });
  }

  private async postModerationAlert(
    review: ReviewWithGame,
    verdict: ModerationVerdict,
    reporterName: string,
    reason?: ReportReason,
  ): Promise<void> {
    await this.discordMessageService.postModerationAlert({
      reviewId: review.id,
      gameName: review.game.name ?? 'Unknown game',
      gameHeaderImage: review.game.headerImage ?? undefined,
      reviewUrl: buildReviewUrl(review.game.slug ?? review.gameId),
      playMethod: review.playMethod,
      translationLayer: review.translationLayer ?? undefined,
      chipset: `${review.chipset} ${review.chipsetVariant}`,
      performance: review.performance,
      notes: review.notes ?? '',
      reportReason: reason,
      reporterName,
      verdict,
    });
  }

  private async resolveReporterName(userId: string): Promise<string> {
    const reporter = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { email: true },
    });

    const email = reporter?.email;
    if (!isNonEmptyString(email)) {
      return 'a user';
    }

    const displayName = deriveDisplayNameFromEmail(email);
    return isNonEmptyString(displayName) ? displayName : 'a user';
  }
}
