import { Injectable } from '@nestjs/common';
import { GameException } from '../../../exceptions/game.exception';
import { TWITCH_TOKEN_URL } from '../constants/twitch-token-url.constant';
import { IGDB_API_BASE_URL } from '../constants/igdb-api-base-url.constant';
import { TOKEN_REFRESH_MARGIN_MS } from '../constants/token-refresh-margin-ms.constant';
import { RATE_LIMIT_INTERVAL_MS } from '../constants/rate-limit-interval-ms.constant';
import { IGDB_GAME_FIELDS } from '../constants/igdb-game-fields.constant';
import { EXTERNAL_GAME_SOURCE_STEAM } from '../constants/external-game-source-steam.constant';
import { SEARCHABLE_IGDB_GAME_TYPES } from '../constants/searchable-igdb-game-types.constant';
import { escapeIgdbQueryValue } from '../utils/escape-igdb-query-value.util';
import type { IgdbGameData } from '../types/igdb-game-data.type';

type TwitchAccessToken = {
  accessToken: string;
  expiresAt: number;
};

@Injectable()
export class IgdbApiClientService {
  private cachedAccessToken: TwitchAccessToken | null = null;
  private rateLimitChain: Promise<void> = Promise.resolve();

  async searchGames({
    query,
    limit = 20,
  }: {
    query: string;
    limit?: number;
  }): Promise<IgdbGameData[]> {
    const apicalypseQuery =
      `search "${escapeIgdbQueryValue(query)}";` +
      ` fields ${IGDB_GAME_FIELDS};` +
      ` where version_parent = null & game_type = (${SEARCHABLE_IGDB_GAME_TYPES.join(',')});` +
      ` limit ${limit};`;

    return this.queryIgdb<IgdbGameData[]>({
      endpoint: 'games',
      query: apicalypseQuery,
    });
  }

  async getGameById({
    igdbId,
  }: {
    igdbId: number;
  }): Promise<IgdbGameData | null> {
    const apicalypseQuery =
      `fields ${IGDB_GAME_FIELDS};` + ` where id = ${igdbId};` + ` limit 1;`;

    const games = await this.queryIgdb<IgdbGameData[]>({
      endpoint: 'games',
      query: apicalypseQuery,
    });
    return games[0] ?? null;
  }

  async getGameBySlug({
    slug,
  }: {
    slug: string;
  }): Promise<IgdbGameData | null> {
    const apicalypseQuery =
      `fields ${IGDB_GAME_FIELDS};` +
      ` where slug = "${escapeIgdbQueryValue(slug)}";` +
      ` limit 1;`;

    const games = await this.queryIgdb<IgdbGameData[]>({
      endpoint: 'games',
      query: apicalypseQuery,
    });
    return games[0] ?? null;
  }

  async getGameBySteamAppId({
    steamAppId,
  }: {
    steamAppId: string;
  }): Promise<IgdbGameData | null> {
    const gameFields = IGDB_GAME_FIELDS.split(',')
      .map((field) => `game.${field}`)
      .join(',');

    const apicalypseQuery =
      `fields ${gameFields};` +
      ` where uid = "${escapeIgdbQueryValue(steamAppId)}"` +
      ` & external_game_source = ${EXTERNAL_GAME_SOURCE_STEAM};` +
      ` limit 1;`;

    const externalGames = await this.queryIgdb<Array<{ game?: IgdbGameData }>>(
      { endpoint: 'external_games', query: apicalypseQuery },
    );

    return externalGames[0]?.game ?? null;
  }

  private async requestTwitchAccessToken(): Promise<string> {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new GameException(
        'Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET environment variable',
        'GAME_SOURCE_MISCONFIGURED',
      );
    }

    const url =
      `${TWITCH_TOKEN_URL}?client_id=${encodeURIComponent(clientId)}` +
      `&client_secret=${encodeURIComponent(clientSecret)}` +
      `&grant_type=client_credentials`;

    const response = await fetch(url, { method: 'POST' });

    if (!response.ok) {
      const errorText = await response.text();
      throw new GameException(
        `Failed to obtain Twitch access token (${response.status}): ${errorText}`,
        'GAME_SOURCE_REQUEST_FAILED',
      );
    }

    const body: { access_token: string; expires_in: number } =
      await response.json();

    this.cachedAccessToken = {
      accessToken: body.access_token,
      expiresAt: Date.now() + body.expires_in * 1000,
    };

    return body.access_token;
  }

  private async getTwitchAccessToken(): Promise<string> {
    if (
      this.cachedAccessToken &&
      Date.now() < this.cachedAccessToken.expiresAt - TOKEN_REFRESH_MARGIN_MS
    ) {
      return this.cachedAccessToken.accessToken;
    }

    return this.requestTwitchAccessToken();
  }

  private waitForRateLimitSlot(): Promise<void> {
    const previous = this.rateLimitChain;
    this.rateLimitChain = previous.then(
      () =>
        new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_INTERVAL_MS)),
    );
    return previous;
  }

  private async performIgdbRequest({
    endpoint,
    query,
    accessToken,
  }: {
    endpoint: string;
    query: string;
    accessToken: string;
  }): Promise<Response> {
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (!clientId) {
      throw new GameException(
        'Missing TWITCH_CLIENT_ID environment variable',
        'GAME_SOURCE_MISCONFIGURED',
      );
    }

    return fetch(`${IGDB_API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      body: query,
    });
  }

  private async queryIgdb<TResult>({
    endpoint,
    query,
  }: {
    endpoint: string;
    query: string;
  }): Promise<TResult> {
    await this.waitForRateLimitSlot();

    let accessToken = await this.getTwitchAccessToken();
    let response = await this.performIgdbRequest({
      endpoint,
      query,
      accessToken,
    });

    if (response.status === 401) {
      this.cachedAccessToken = null;
      accessToken = await this.requestTwitchAccessToken();
      await this.waitForRateLimitSlot();
      response = await this.performIgdbRequest({
        endpoint,
        query,
        accessToken,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new GameException(
        `IGDB request to "${endpoint}" failed (${response.status}): ${errorText}`,
        'GAME_SOURCE_REQUEST_FAILED',
      );
    }

    const result: TResult = await response.json();
    return result;
  }
}
