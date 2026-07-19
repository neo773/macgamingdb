import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { isNonEmptyString } from '@sniptt/guards';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { gameReviews, users } from '../../../database/schema';
import { deriveDisplayNameFromEmail } from '../../../engine/utils/derive-display-name-from-email.util';
import { MODERATION_LLM } from '../constants/moderation-llm.constant';
import { type ModerationLlm } from '../types/moderation-llm.type';
import { type ReportReason } from '../dtos/report-reason.dto';
import { DiscordMessageService } from '../drivers/discord/services/discord-message.service';
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

@Injectable()
export class ReportService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB,
    @Inject(MODERATION_LLM) private readonly moderationLlm: ModerationLlm,
    private readonly discordMessageService: DiscordMessageService,
  ) {}

  private async findReviewWithGame(reviewId: string) {
    return this.db.query.gameReviews.findFirst({
      where: eq(gameReviews.id, reviewId),
      with: { game: true },
    });
  }

  async reportReview(params: ReportReviewParams) {
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

    const [claimed] = await this.db
      .update(gameReviews)
      .set({ moderationAlertedAt: new Date().toISOString() })
      .where(
        and(
          eq(gameReviews.id, params.reviewId),
          isNull(gameReviews.moderationAlertedAt),
        ),
      )
      .returning({ id: gameReviews.id });

    if (!claimed) {
      return { success: true, message: 'Report submitted' };
    }

    try {
      await this.dispatchModerationAlert({
        review,
        reason: params.reason,
        reporterUserId: params.reporterUserId,
      });
    } catch (error) {
      console.error('Failed to dispatch moderation alert:', error);
      await this.db
        .update(gameReviews)
        .set({ moderationAlertedAt: null })
        .where(eq(gameReviews.id, params.reviewId));
    }

    return { success: true, message: 'Report submitted' };
  }

  private async dispatchModerationAlert(params: {
    review: ReviewWithGame;
    reason?: ReportReason;
    reporterUserId: string;
  }): Promise<void> {
    const { review } = params;

    const verdict = await this.moderationLlm.judgeReview({
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
      reportReason: params.reason,
    });

    const reporterName = await this.resolveReporterName(params.reporterUserId);

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
      reportReason: params.reason,
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
