import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../../../database/drizzle';
import {
  LibraryProvider,
  userExternalAccounts,
  userLibraryEntries,
} from '../../../../../database/schema';
import { STEAM_LIBRARY_INSERT_CHUNK_SIZE } from '../constants/steam-library-insert-chunk-size.constant';
import { type SteamSyncResult } from '../types/steam-sync-result.type';
import { toLibraryEntryRow } from '../utils/to-library-entry-row.util';
import { SteamWebApiService } from './steam-web-api.service';

@Injectable()
export class SteamLibrarySyncService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB,
    private readonly steamWebApiService: SteamWebApiService,
  ) {}

  async syncLibraryForUser({
    userId,
  }: {
    userId: string;
  }): Promise<SteamSyncResult> {
    const link = await this.db.query.userExternalAccounts.findFirst({
      where: and(
        eq(userExternalAccounts.userId, userId),
        eq(userExternalAccounts.provider, LibraryProvider.STEAM),
      ),
    });
    if (!link) {
      throw new Error('Steam account not linked');
    }

    const ownedGames = await this.steamWebApiService.getOwnedGames({
      steamId: link.externalUserId,
    });
    const syncedAt = new Date().toISOString();
    const rows = ownedGames.map((game) =>
      toLibraryEntryRow({ userId, syncedAt, game }),
    );

    await this.db.transaction(async (tx) => {
      await tx
        .delete(userLibraryEntries)
        .where(
          and(
            eq(userLibraryEntries.userId, userId),
            eq(userLibraryEntries.provider, LibraryProvider.STEAM),
          ),
        );

      for (
        let index = 0;
        index < rows.length;
        index += STEAM_LIBRARY_INSERT_CHUNK_SIZE
      ) {
        await tx
          .insert(userLibraryEntries)
          .values(rows.slice(index, index + STEAM_LIBRARY_INSERT_CHUNK_SIZE));
      }

      await tx
        .update(userExternalAccounts)
        .set({ lastSyncedAt: syncedAt })
        .where(eq(userExternalAccounts.id, link.id));
    });

    return { count: ownedGames.length, syncedAt };
  }
}
