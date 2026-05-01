import { TRPCError } from '@trpc/server';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { router, protectedProcedure } from '../trpc';
import {
  LibraryProvider,
  type PerformanceRating,
  games,
  userExternalAccounts,
  userLibraryEntries,
} from '../drizzle/schema';

const PERFORMANCE_ORDER: Record<PerformanceRating, number> = {
  EXCELLENT: 0,
  VERY_GOOD: 1,
  GOOD: 2,
  PLAYABLE: 3,
  BARELY_PLAYABLE: 4,
  UNPLAYABLE: 5,
};
import {
  SteamLibraryPrivateError,
} from '../services/steam-openid';
import { syncSteamLibraryForUser } from '../services/steam-library';

function requireUserId(user: unknown): string {
  const userId = (user as { user?: { id?: string } } | null | undefined)?.user?.id;
  if (!userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing authorization' });
  }
  return userId;
}

export const libraryRouter = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    const userId = requireUserId(ctx.user);
    const link = await ctx.db.query.userExternalAccounts.findFirst({
      where: and(
        eq(userExternalAccounts.userId, userId),
        eq(userExternalAccounts.provider, LibraryProvider.STEAM),
      ),
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
    const userId = requireUserId(ctx.user);
    try {
      return await syncSteamLibraryForUser(ctx.db, userId);
    } catch (err) {
      if (err instanceof SteamLibraryPrivateError) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'STEAM_LIBRARY_PRIVATE',
        });
      }
      throw err;
    }
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = requireUserId(ctx.user);

    const entries = await ctx.db
      .select()
      .from(userLibraryEntries)
      .where(
        and(
          eq(userLibraryEntries.userId, userId),
          eq(userLibraryEntries.provider, LibraryProvider.STEAM),
        ),
      )
      .orderBy(desc(userLibraryEntries.playtimeMinutes));

    if (entries.length === 0) return [];

    const ids = entries.map((e) => e.externalGameId);
    const matchedGames = await ctx.db
      .select({
        id: games.id,
        aggregatedPerformance: games.aggregatedPerformance,
        reviewCount: games.reviewCount,
      })
      .from(games)
      .where(inArray(games.id, ids));

    const gameMap = new Map(matchedGames.map((g) => [g.id, g]));

    const rows = entries.map((e) => {
      const matched = gameMap.get(e.externalGameId);
      const rating = matched?.aggregatedPerformance ?? null;
      return {
        externalGameId: e.externalGameId,
        name: e.name,
        iconHash: e.iconHash,
        playtimeMinutes: e.playtimeMinutes,
        aggregatedPerformance: rating,
        reviewCount: matched?.reviewCount ?? 0,
        hasData: rating !== null,
      };
    });

    // Sort by playability (EXCELLENT first → UNPLAYABLE), unrated last,
    // playtime desc as tiebreaker.
    rows.sort((a, b) => {
      const ra = a.aggregatedPerformance
        ? PERFORMANCE_ORDER[a.aggregatedPerformance]
        : Number.MAX_SAFE_INTEGER;
      const rb = b.aggregatedPerformance
        ? PERFORMANCE_ORDER[b.aggregatedPerformance]
        : Number.MAX_SAFE_INTEGER;
      if (ra !== rb) return ra - rb;
      return b.playtimeMinutes - a.playtimeMinutes;
    });

    return rows;
  }),

  unlink: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = requireUserId(ctx.user);
    await ctx.db
      .delete(userLibraryEntries)
      .where(
        and(
          eq(userLibraryEntries.userId, userId),
          eq(userLibraryEntries.provider, LibraryProvider.STEAM),
        ),
      );
    await ctx.db
      .delete(userExternalAccounts)
      .where(
        and(
          eq(userExternalAccounts.userId, userId),
          eq(userExternalAccounts.provider, LibraryProvider.STEAM),
        ),
      );
    return { ok: true };
  }),
});
