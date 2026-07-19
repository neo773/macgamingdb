import { Inject, Injectable } from '@nestjs/common';
import { count, desc, eq, inArray } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import {
  games,
  macConfigs,
  users,
  visibleGameReviews,
} from '../../../database/schema';
import { deriveDisplayNameFromEmail } from '../../../engine/utils/derive-display-name-from-email.util';
import { ContributorException } from '../exceptions/contributor.exception';

const toISODateString = (value: string | number): string =>
  typeof value === 'number' ? new Date(value).toISOString() : value;

@Injectable()
export class ContributorService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB) {}

  async getById(id: string) {
    try {
      const [contributor] = await this.db
        .select({
          id: users.id,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!contributor) {
        throw new ContributorException(
          'Contributor not found',
          'CONTRIBUTOR_NOT_FOUND',
        );
      }

      const reviewRows = await this.db
        .select()
        .from(visibleGameReviews)
        .innerJoin(games, eq(visibleGameReviews.gameId, games.id))
        .leftJoin(macConfigs, eq(visibleGameReviews.macConfigId, macConfigs.id))
        .where(eq(visibleGameReviews.userId, id))
        .orderBy(desc(visibleGameReviews.createdAt));

      const reviews = reviewRows.map((row) => ({
        ...row.VisibleGameReview,
        game: row.Game,
        macConfig: row.MacConfig,
      }));

      const uniqueGamesCount = new Set(reviews.map((review) => review.gameId))
        .size;

      return {
        id: contributor.id,
        name: deriveDisplayNameFromEmail(contributor.email!),
        joinedAt: toISODateString(contributor.createdAt),
        reviewCount: reviews.length,
        uniqueGamesCount,
        reviews: reviews.map((review) => ({
          id: review.id,
          gameId: review.gameId,
          gameName: review.game.name,
          gameSlug: review.game.slug,
          gameHeaderImage: review.game.headerImage,
          playMethod: review.playMethod,
          softwareVersion: review.softwareVersion,
          translationLayer: review.translationLayer,
          performance: review.performance,
          fps: review.fps,
          chipset: review.chipset,
          chipsetVariant: review.chipsetVariant,
          graphicsSettings: review.graphicsSettings,
          resolution: review.resolution,
          notes: review.notes,
          screenshots: review.screenshots,
          createdAt: review.createdAt,
          macConfig: review.macConfig,
        })),
      };
    } catch (error) {
      if (error instanceof ContributorException) throw error;
      console.error('Error fetching contributor:', error);
      throw new ContributorException(
        'Failed to fetch contributor',
        'CONTRIBUTOR_FETCH_FAILED',
      );
    }
  }

  async getTopContributors(input: { limit: number; cursor?: number | null }) {
    try {
      const { limit } = input;
      const offset = input.cursor ?? 0;

      const reviewCountSq = this.db
        .select({
          userId: visibleGameReviews.userId,
          reviewCount: count().as('reviewCount'),
        })
        .from(visibleGameReviews)
        .groupBy(visibleGameReviews.userId)
        .as('reviewCountSq');

      const userReviewCounts = await this.db
        .select({
          id: users.id,
          email: users.email,
          createdAt: users.createdAt,
          reviewCount: reviewCountSq.reviewCount,
        })
        .from(users)
        .innerJoin(reviewCountSq, eq(users.id, reviewCountSq.userId))
        .orderBy(desc(reviewCountSq.reviewCount), users.id)
        .limit(limit + 1)
        .offset(offset);

      const hasMore = userReviewCounts.length > limit;
      const pageRows = hasMore
        ? userReviewCounts.slice(0, limit)
        : userReviewCounts;

      const contributors = await Promise.all(
        pageRows.map(async (user) => {
          const uniqueGames = await this.db
            .selectDistinct({ gameId: visibleGameReviews.gameId })
            .from(visibleGameReviews)
            .where(eq(visibleGameReviews.userId, user.id));

          return {
            id: user.id,
            name: deriveDisplayNameFromEmail(user!.email!),
            joinedAt: toISODateString(user.createdAt),
            reviewCount: user.reviewCount,
            uniqueGamesCount: uniqueGames.length,
            score: user.reviewCount * 10 + uniqueGames.length * 5,
          };
        }),
      );

      const nextCursor = hasMore ? offset + limit : null;

      const usersWithReviews = this.db
        .selectDistinct({ userId: visibleGameReviews.userId })
        .from(visibleGameReviews);

      const [totalResult] = await this.db
        .select({ count: count() })
        .from(users)
        .where(inArray(users.id, usersWithReviews));

      return {
        contributors,
        nextCursor,
        totalCount: totalResult?.count ?? 0,
      };
    } catch (error) {
      console.error('Error fetching contributors:', error);
      throw new ContributorException(
        'Failed to fetch contributors',
        'CONTRIBUTOR_FETCH_FAILED',
      );
    }
  }
}
