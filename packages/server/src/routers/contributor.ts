import { z } from 'zod';
import { router, procedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { users, gameReviews } from '../drizzle/schema';
import { eq, desc, count, inArray } from 'drizzle-orm';
import {
  ContributorDetailSchema,
  ContributorsPageSchema,
} from '../schema/openapi';

// better-auth writes user.createdAt as epoch millis while our own rows are ISO
// strings — SQLite's dynamic typing happily stores both in the TEXT column
const toISODateString = (value: string | number): string =>
  typeof value === 'number' ? new Date(value).toISOString() : value;

export const contributorRouter = router({
  getById: procedure
    .meta({ openapi: { method: 'GET', path: '/contributors/{id}', protect: false, tags: ['contributors'] } })
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(ContributorDetailSchema)
    .query(async ({ input, ctx }) => {
      try {
        const [contributor] = await ctx.db
          .select({
            id: users.id,
            email: users.email,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(eq(users.id, input.id))
          .limit(1);

        if (!contributor) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Contributor not found',
          });
        }

        const reviews = await ctx.db.query.gameReviews.findMany({
          where: eq(gameReviews.userId, input.id),
          with: {
            game: true,
            macConfig: true,
          },
          orderBy: desc(gameReviews.createdAt),
        });

        const uniqueGamesCount = new Set(reviews.map((r) => r.gameId)).size;


        return {
          id: contributor.id,
          name: contributor.email!.split('@')[0].replace(/[0-9._]/g, ''),
          joinedAt: toISODateString(contributor.createdAt),
          reviewCount: reviews.length,
          uniqueGamesCount,
          reviews: reviews.map((review) => {
            return {
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
              graphicsSettings: review.graphicsSettings,
              resolution: review.resolution,
              notes: review.notes,
              screenshots: review.screenshots,
              createdAt: review.createdAt,
              macConfig: review.macConfig,
            };
          }),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error fetching contributor:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch contributor',
        });
      }
    }),

  getTopContributors: procedure
    .meta({ openapi: { method: 'GET', path: '/contributors', protect: false, tags: ['contributors'] } })
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.number().int().min(0).nullish(),
      }),
    )
    .output(ContributorsPageSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { limit } = input;
        const offset = input.cursor ?? 0;

        // Subquery: count reviews per user
        const reviewCountSq = ctx.db
          .select({
            userId: gameReviews.userId,
            reviewCount: count().as('reviewCount'),
          })
          .from(gameReviews)
          .groupBy(gameReviews.userId)
          .as('reviewCountSq');

        // Join users with review counts, ordered by review count desc.
        // Tie-break on users.id so paginated offsets are stable across pages.
        const userReviewCounts = await ctx.db
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
            const uniqueGames = await ctx.db
              .selectDistinct({ gameId: gameReviews.gameId })
              .from(gameReviews)
              .where(eq(gameReviews.userId, user.id));

            return {
              id: user.id,
              name: user!.email!.split('@')[0].replace(/[0-9._]/g, ''),
              joinedAt: toISODateString(user.createdAt),
              reviewCount: user.reviewCount,
              uniqueGamesCount: uniqueGames.length,
              score: user.reviewCount * 10 + uniqueGames.length * 5,
            };
          }),
        );

        const nextCursor = hasMore ? offset + limit : null;

        // Count total users who have at least one review
        const usersWithReviews = ctx.db
          .selectDistinct({ userId: gameReviews.userId })
          .from(gameReviews);

        const [totalResult] = await ctx.db
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
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch contributors',
        });
      }
    }),
});
