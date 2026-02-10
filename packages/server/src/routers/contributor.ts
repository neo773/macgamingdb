import { z } from 'zod';
import { router, procedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { users, gameReviews } from '../drizzle/schema';
import { eq, desc, count, inArray } from 'drizzle-orm';

interface GameDetails {
  name?: string;
  header_image?: string;
}

export const contributorRouter = router({
  getById: procedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
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
          joinedAt: contributor.createdAt,
          reviewCount: reviews.length,
          uniqueGamesCount,
          reviews: reviews.map((review) => {
            const gameDetails = JSON.parse(review.game.details!) as GameDetails;
            return {
              id: review.id,
              gameId: review.gameId,
              gameName: gameDetails.name,
              gameDetails: review.game.details,
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
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const { limit, cursor } = input;

        // Subquery: count reviews per user
        const reviewCountSq = ctx.db
          .select({
            userId: gameReviews.userId,
            reviewCount: count().as('reviewCount'),
          })
          .from(gameReviews)
          .groupBy(gameReviews.userId)
          .as('reviewCountSq');

        // Join users with review counts, ordered by review count desc
        const userReviewCounts = await ctx.db
          .select({
            id: users.id,
            email: users.email,
            createdAt: users.createdAt,
            reviewCount: reviewCountSq.reviewCount,
          })
          .from(users)
          .innerJoin(reviewCountSq, eq(users.id, reviewCountSq.userId))
          .orderBy(desc(reviewCountSq.reviewCount))
          .limit(limit + 1)
          .offset(cursor ? 1 : 0);

        const usersWithGameCounts = await Promise.all(
          userReviewCounts.map(async (user) => {
            const uniqueGames = await ctx.db
              .selectDistinct({ gameId: gameReviews.gameId })
              .from(gameReviews)
              .where(eq(gameReviews.userId, user.id));

            return {
              id: user.id,
              name: user!.email!.split('@')[0].replace(/[0-9._]/g, ''),
              joinedAt: user.createdAt,
              reviewCount: user.reviewCount,
              uniqueGamesCount: uniqueGames.length,
              score: user.reviewCount * 10 + uniqueGames.length * 5,
            };
          }),
        );

        const contributors = usersWithGameCounts.sort((a, b) => b.score - a.score);

        let nextCursor: typeof cursor = undefined;
        if (contributors.length > limit) {
          const nextItem = contributors.pop();
          nextCursor = nextItem!.id;
        }

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
