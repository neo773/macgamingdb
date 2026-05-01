import { and, eq } from 'drizzle-orm';
import { type DrizzleDB } from '../database/drizzle';
import {
  LibraryProvider,
  userExternalAccounts,
  userLibraryEntries,
} from '../drizzle/schema';
import { getOwnedGames } from './steam-openid';

export interface SyncResult {
  count: number;
  syncedAt: string;
}

export async function syncSteamLibraryForUser(
  db: DrizzleDB,
  userId: string,
): Promise<SyncResult> {
  const link = await db.query.userExternalAccounts.findFirst({
    where: and(
      eq(userExternalAccounts.userId, userId),
      eq(userExternalAccounts.provider, LibraryProvider.STEAM),
    ),
  });
  if (!link) throw new Error('Steam account not linked');

  const { games: ownedGames } = await getOwnedGames(link.externalUserId);
  const syncedAt = new Date().toISOString();

  await db
    .delete(userLibraryEntries)
    .where(
      and(
        eq(userLibraryEntries.userId, userId),
        eq(userLibraryEntries.provider, LibraryProvider.STEAM),
      ),
    );

  if (ownedGames.length > 0) {
    const rows = ownedGames.map((g) => ({
      userId,
      provider: LibraryProvider.STEAM,
      externalGameId: String(g.appid),
      // gameId left null — resolved via join at read time. We avoid a write-time
      // FK insert because most owned appids won't yet have a row in `Game`.
      gameId: null,
      name: g.name ?? null,
      iconHash: g.img_icon_url ?? null,
      playtimeMinutes: g.playtime_forever ?? 0,
      lastSyncedAt: syncedAt,
    }));

    const CHUNK = 200;
    for (let i = 0; i < rows.length; i += CHUNK) {
      await db.insert(userLibraryEntries).values(rows.slice(i, i + CHUNK));
    }
  }

  await db
    .update(userExternalAccounts)
    .set({ lastSyncedAt: syncedAt })
    .where(eq(userExternalAccounts.id, link.id));

  return { count: ownedGames.length, syncedAt };
}
