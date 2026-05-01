import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import { protectedProcedure, router } from '../trpc';
import {
  LibraryProvider,
  type PerformanceRating,
  games,
  userExternalAccounts,
  userLibraryEntries,
} from '../drizzle/schema';
import {
  STEAM_LIBRARY_PRIVATE_CODE,
  SteamLibraryPrivateError,
} from '../services/steam-api';
import { syncSteamLibraryForUser } from '../services/steam-library';

const PERFORMANCE_RANK: Record<PerformanceRating, number> = {
  EXCELLENT: 0,
  VERY_GOOD: 1,
  GOOD: 2,
  PLAYABLE: 3,
  BARELY_PLAYABLE: 4,
  UNPLAYABLE: 5,
};

const UNRATED_RANK = Number.MAX_SAFE_INTEGER;

function rankForRating(rating: PerformanceRating | null): number {
  return rating === null ? UNRATED_RANK : PERFORMANCE_RANK[rating];
}

function requireUserId(ctx: { user?: { user?: { id?: string } } | null }): string {
  const userId = ctx.user?.user?.id;
  if (!userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing authorization' });
  }
  return userId;
}

const steamConnectionWhere = (userId: string) =>
  and(
    eq(userExternalAccounts.userId, userId),
    eq(userExternalAccounts.provider, LibraryProvider.STEAM),
  );

const steamEntriesWhere = (userId: string) =>
  and(
    eq(userLibraryEntries.userId, userId),
    eq(userLibraryEntries.provider, LibraryProvider.STEAM),
  );

export const libraryRouter = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    const userId = requireUserId(ctx);
    const link = await ctx.db.query.userExternalAccounts.findFirst({
      where: steamConnectionWhere(userId),
    });
    if (!link) return { linked: false as const };
    return {
      linked: true as const,
      provider: link.provider,
      externalUserId: link.externalUserId,
      lastSyncedAt: link.lastSyncedAt,
    };
  }),

  sync: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = requireUserId(ctx);
    try {
      return await syncSteamLibraryForUser(ctx.db, userId);
    } catch (err) {
      if (err instanceof SteamLibraryPrivateError) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: STEAM_LIBRARY_PRIVATE_CODE,
        });
      }
      throw err;
    }
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = requireUserId(ctx);

    const entries = await ctx.db
      .select()
      .from(userLibraryEntries)
      .where(steamEntriesWhere(userId));

    if (entries.length === 0) return [];

    const matchedGames = await ctx.db
      .select({
        id: games.id,
        aggregatedPerformance: games.aggregatedPerformance,
        reviewCount: games.reviewCount,
      })
      .from(games)
      .where(
        inArray(
          games.id,
          entries.map((e) => e.externalGameId),
        ),
      );

    const gameById = new Map(matchedGames.map((g) => [g.id, g]));

    const rows = entries.map((entry) => {
      const matched = gameById.get(entry.externalGameId);
      const rating = matched?.aggregatedPerformance ?? null;
      return {
        externalGameId: entry.externalGameId,
        name: entry.name,
        iconHash: entry.iconHash,
        playtimeMinutes: entry.playtimeMinutes,
        aggregatedPerformance: rating,
        reviewCount: matched?.reviewCount ?? 0,
        hasData: rating !== null,
      };
    });

    rows.sort((a, b) => {
      const byRating =
        rankForRating(a.aggregatedPerformance) -
        rankForRating(b.aggregatedPerformance);
      return byRating !== 0
        ? byRating
        : b.playtimeMinutes - a.playtimeMinutes;
    });

    return rows;
  }),

  unlink: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = requireUserId(ctx);

    await ctx.db.transaction(async (tx) => {
      await tx.delete(userLibraryEntries).where(steamEntriesWhere(userId));
      await tx.delete(userExternalAccounts).where(steamConnectionWhere(userId));
    });

    return { ok: true };
  }),
});
