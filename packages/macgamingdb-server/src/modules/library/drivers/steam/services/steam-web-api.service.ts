import { Injectable } from '@nestjs/common';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { STEAM_API_BASE_URL } from '../constants/steam-api-base-url.constant';
import { SteamLibraryPrivateError } from '../exceptions/steam-library-private.exception';
import { type SteamOwnedGame } from '../types/steam-owned-game.type';

type GetOwnedGamesResponse = {
  response?: {
    game_count?: number;
    games?: SteamOwnedGame[];
  };
};

@Injectable()
export class SteamWebApiService {
  async getOwnedGames({
    steamId,
  }: {
    steamId: string;
  }): Promise<SteamOwnedGame[]> {
    const apiKey = process.env.STEAM_WEB_API_KEY;
    if (!apiKey) {
      throw new Error('STEAM_WEB_API_KEY not configured');
    }

    const url = new URL(`${STEAM_API_BASE_URL}/IPlayerService/GetOwnedGames/v1/`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('steamid', steamId);
    url.searchParams.set('include_appinfo', '1');
    url.searchParams.set('include_played_free_games', '1');
    url.searchParams.set('format', 'json');

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Steam GetOwnedGames returned ${response.status}`);
    }

    const json: GetOwnedGamesResponse = await response.json();

    if (!json.response || !isDefined(json.response.game_count)) {
      throw new SteamLibraryPrivateError();
    }

    return json.response.games ?? [];
  }
}
