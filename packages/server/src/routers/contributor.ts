import { z } from 'zod';
import { router, procedure } from '../trpc';
import { TRPCError } from '@trpc/server';

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
        const contributor = await ctx.prisma!.user.findUnique({
          where: { id: input.id },
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        });

        if (!contributor) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Contributor not found',
          });
        }

        const reviews = await ctx.prisma!.gameReview.findMany({
          where: { userId: input.id },
          include: {
            game: true,
            macConfig: true,
          },
          orderBy: { createdAt: 'desc' },
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

        const contributors = await ctx.prisma!.$transaction(
          async (tx) => {
            const userReviewCounts = await tx.user.findMany({
              select: {
                id: true,
                email: true,
                createdAt: true,
                _count: {
                  select: {
                    reviews: true,
                  },
                },
              },
              orderBy: {
                reviews: {
                  _count: 'desc',
                },
              },
              take: limit + 1,
              ...(cursor
                ? {
                  skip: 1,
                  cursor: {
                    id: cursor,
                  },
                }
                : {}),
            });

            const usersWithGameCounts = await Promise.all(
              userReviewCounts.map(async (user) => {
                const uniqueGames = await tx.gameReview.groupBy({
                  by: ['gameId'],
                  where: {
                    userId: user.id,
                  },
                });

                return {
                  id: user.id,
                  name: user!.email!.split('@')[0].replace(/[0-9._]/g, ''),
                  joinedAt: user.createdAt,
                  reviewCount: user._count.reviews,
                  uniqueGamesCount: uniqueGames.length,

                  score: user._count.reviews * 10 + uniqueGames.length * 5,
                };
              }),
            );

            return usersWithGameCounts.sort((a, b) => b.score - a.score);
          },
          {
            timeout: 10000,
          },
        );

        let nextCursor: typeof cursor = undefined;
        if (contributors.length > limit) {
          const nextItem = contributors.pop();
          nextCursor = nextItem!.id;
        }

        return {
          contributors,
          nextCursor,
          totalCount: await ctx.prisma!.user.count({
            where: {
              reviews: {
                some: {},
              },
            },
          }),
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
