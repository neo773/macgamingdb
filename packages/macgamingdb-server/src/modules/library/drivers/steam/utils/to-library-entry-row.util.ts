import { LibraryProvider } from '../../../../../database/schema';
import { type SteamOwnedGame } from '../types/steam-owned-game.type';

type ToLibraryEntryRowParams = {
  userId: string;
  syncedAt: string;
  game: SteamOwnedGame;
};

export const toLibraryEntryRow = ({
  userId,
  syncedAt,
  game,
}: ToLibraryEntryRowParams) => ({
  userId,
  provider: LibraryProvider.STEAM,
  externalGameId: String(game.appid),
  gameId: null,
  name: game.name ?? null,
  iconHash: game.img_icon_url ?? null,
  playtimeMinutes: game.playtime_forever ?? 0,
  lastSyncedAt: syncedAt,
});
