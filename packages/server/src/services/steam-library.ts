import { and, eq } from 'drizzle-orm';
import { type DrizzleDB } from '../database/drizzle';
import {
  LibraryProvider,
  userExternalAccounts,
  userLibraryEntries,
} from '../drizzle/schema';
import { getOwnedGames, type SteamOwnedGame } from './steam-api';

const INSERT_CHUNK_SIZE = 200;

export interface SyncResult {
  count: number;
  syncedAt: string;
}

function toLibraryEntryRow(
  userId: string,
  syncedAt: string,
  game: SteamOwnedGame,
) {
  return {
    userId,
    provider: LibraryProvider.STEAM,
    externalGameId: String(game.appid),
    gameId: null,
    name: game.name ?? null,
    iconHash: game.img_icon_url ?? null,
    playtimeMinutes: game.playtime_forever ?? 0,
    lastSyncedAt: syncedAt,
  };
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

  const ownedGames = await getOwnedGames(link.externalUserId);
  const syncedAt = new Date().toISOString();
  const rows = ownedGames.map((g) => toLibraryEntryRow(userId, syncedAt, g));

  await db.transaction(async (tx) => {
    await tx
      .delete(userLibraryEntries)
      .where(
        and(
          eq(userLibraryEntries.userId, userId),
          eq(userLibraryEntries.provider, LibraryProvider.STEAM),
        ),
      );

    for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
      await tx
        .insert(userLibraryEntries)
        .values(rows.slice(i, i + INSERT_CHUNK_SIZE));
    }

    await tx
      .update(userExternalAccounts)
      .set({ lastSyncedAt: syncedAt })
      .where(eq(userExternalAccounts.id, link.id));
  });

  return { count: ownedGames.length, syncedAt };
}
