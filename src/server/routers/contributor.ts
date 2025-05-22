import { z } from "zod";
import { router, procedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const contributorRouter = router({
  getTopContributors: procedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { limit, cursor } = input;

        // Get all users with their review counts and unique game counts
        const contributors = await ctx.prisma!.$transaction(async (tx) => {
          // First, get all users with their review counts
          const userReviewCounts = await tx.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true,
              _count: {
                select: {
                  reviews: true,
                }
              },
            },
            orderBy: {
              reviews: {
                _count: 'desc',
              },
            },
            take: limit + 1, // Take one extra for cursor
            ...(cursor ? { 
              skip: 1,
              cursor: {
                id: cursor,
              },
            } : {}),
          });

          // For each user, get the count of unique games they've reviewed
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
                image: user.image,
                joinedAt: user.createdAt,
                reviewCount: user._count.reviews,
                uniqueGamesCount: uniqueGames.length,
                // Create a score that factors in both metrics
                score: user._count.reviews * 10 + uniqueGames.length * 5,
              };
            })
          );

          // Sort by score in descending order
          return usersWithGameCounts.sort((a, b) => b.score - a.score);
        });

        // Handle pagination
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
        console.error("Error fetching contributors:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch contributors",
        });
      }
    }),
}); 