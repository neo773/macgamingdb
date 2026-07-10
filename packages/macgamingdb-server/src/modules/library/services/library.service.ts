import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import {
  LibraryProvider,
  games,
  gameSourceLinks,
  userExternalAccounts,
  userLibraryEntries,
  type PerformanceRating,
} from '../../../drizzle/schema';
import {
  STEAM_LIBRARY_PRIVATE_CODE,
  SteamLibraryPrivateError,
} from '../../../services/steam-api';
import { syncSteamLibraryForUser } from '../../../services/steam-library';
import { buildSteamOpenIdRedirectUrl } from '../../../services/steam-openid';
import {
  getAppOrigin,
  issueStateToken,
} from '../../../services/steam-openid-state';
import { LibraryException } from '../exceptions/library.exception';

const PERFORMANCE_RANK: Record<PerformanceRating, number> = {
  EXCELLENT: 0,
  VERY_GOOD: 1,
  GOOD: 2,
  PLAYABLE: 3,
  BARELY_PLAYABLE: 4,
  UNPLAYABLE: 5,
};

const UNRATED_RANK = Number.MAX_SAFE_INTEGER;

const rankForRating = (rating: PerformanceRating | null): number =>
  rating === null ? UNRATED_RANK : PERFORMANCE_RANK[rating];

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

@Injectable()
export class LibraryService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB) {}

  async linkStartUrl(userId: string) {
    const origin = getAppOrigin();

    const state = await issueStateToken(userId);
    const returnTo = new URL('/api/connections/steam/app-callback', origin);
    returnTo.searchParams.set('state', state);

    return {
      url: buildSteamOpenIdRedirectUrl(returnTo.toString(), `${origin}/`),
    };
  }

  async status(userId: string) {
    const link = await this.db.query.userExternalAccounts.findFirst({
      where: steamConnectionWhere(userId),
    });
    if (!link) return { linked: false as const };
    return {
      linked: true as const,
      provider: link.provider,
      externalUserId: link.externalUserId,
      lastSyncedAt: link.lastSyncedAt,
    };
  }

  async sync(userId: string) {
    try {
      return await syncSteamLibraryForUser(this.db, userId);
    } catch (err) {
      if (err instanceof SteamLibraryPrivateError) {
        throw new LibraryException(
          STEAM_LIBRARY_PRIVATE_CODE,
          'STEAM_LIBRARY_PRIVATE_PRECONDITION_FAILED',
        );
      }
      throw err;
    }
  }

  async list(userId: string) {
    const entries = await this.db
      .select()
      .from(userLibraryEntries)
      .where(steamEntriesWhere(userId));

    if (entries.length === 0) return [];

    const matchedGames = await this.db
      .select({
        externalId: gameSourceLinks.externalId,
        aggregatedPerformance: games.aggregatedPerformance,
        reviewCount: games.reviewCount,
      })
      .from(gameSourceLinks)
      .innerJoin(games, eq(gameSourceLinks.gameId, games.id))
      .where(
        and(
          eq(gameSourceLinks.source, 'steam'),
          inArray(
            gameSourceLinks.externalId,
            entries.map((e) => e.externalGameId),
          ),
        ),
      );

    const gameByExternalId = new Map(
      matchedGames.map((game) => [game.externalId, game]),
    );

    const rows = entries.map((entry) => {
      const matched = gameByExternalId.get(entry.externalGameId);
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
      return byRating !== 0 ? byRating : b.playtimeMinutes - a.playtimeMinutes;
    });

    return rows;
  }

  async unlink(userId: string) {
    await this.db.transaction(async (tx) => {
      await tx.delete(userLibraryEntries).where(steamEntriesWhere(userId));
      await tx.delete(userExternalAccounts).where(steamConnectionWhere(userId));
    });

    return { ok: true };
  }
}
