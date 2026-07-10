import { GameException } from '../../../exceptions/game.exception';
import type { SteamAppData } from '../types/steam-app-data.type';

type SteamAppsDetailsResponse = Record<
  string,
  { success: boolean; data: SteamAppData } | undefined
>;

export const getGameBySteamId = async (
  steamId: string,
): Promise<SteamAppData | null> => {
  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${steamId}`,
    );
    const gameDetails: SteamAppsDetailsResponse = await response.json();

    const appDetails = gameDetails?.[steamId];
    if (!appDetails?.success) {
      throw new GameException('Game not found', 'GAME_NOT_FOUND');
    }

    return appDetails.data;
  } catch (error) {
    console.error('Error fetching game by Steam ID:', error);
    throw error;
  }
};
