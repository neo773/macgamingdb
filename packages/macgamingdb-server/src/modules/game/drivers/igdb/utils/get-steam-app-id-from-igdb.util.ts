import { EXTERNAL_GAME_SOURCE_STEAM } from '../constants/external-game-source-steam.constant';
import type { IgdbGameData } from '../types/igdb-game-data.type';

export const getSteamAppIdFromIgdb = (game: IgdbGameData): string | null => {
  const steamExternalGame = game.external_games?.find(
    (externalGame) =>
      externalGame.external_game_source === EXTERNAL_GAME_SOURCE_STEAM ||
      externalGame.category === EXTERNAL_GAME_SOURCE_STEAM,
  );

  return steamExternalGame?.uid ?? null;
};
