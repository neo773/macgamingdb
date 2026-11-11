import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { fetchWithRetryOrThrow } from '../../../../../engine/core-modules/http/utils/fetch-with-retry-or-throw.util';
import { GameException } from '../../../exceptions/game.exception';
import { STEAM_STORE_ITEMS_URL } from '../constants/steam-store-items-url.constant';
import { STEAM_TAG_LIST_URL } from '../constants/steam-tag-list-url.constant';
import { STEAM_STORE_ITEMS_BATCH_SIZE } from '../constants/steam-store-items-batch-size.constant';
import { STEAM_STORE_ITEMS_BATCH_INTERVAL_MS } from '../constants/steam-store-items-batch-interval-ms.constant';
import { STEAM_STORE_ITEMS_TAG_COUNT } from '../constants/steam-store-items-tag-count.constant';
import type { SteamTagVotesByAppId } from '../types/steam-tag-votes-by-app-id.type';

const steamTagListResponseSchema = z.object({
  response: z.object({
    tags: z.array(z.object({ tagid: z.number(), name: z.string() })),
  }),
});

const steamStoreItemsResponseSchema = z.object({
  response: z.object({
    store_items: z
      .array(
        z.object({
          appid: z.number().optional(),
          tags: z
            .array(z.object({ tagid: z.number(), weight: z.number() }))
            .optional(),
        }),
      )
      .optional(),
  }),
});

@Injectable()
export class SteamStoreTagsService {
  private tagNamesById: Map<number, string> | undefined;

  async fetchTagVotesByAppIds({
    steamAppIds,
  }: {
    steamAppIds: string[];
  }): Promise<SteamTagVotesByAppId> {
    const tagNamesById = await this.loadTagNamesById();
    const tagVotesByAppId: SteamTagVotesByAppId = new Map();

    for (
      let offset = 0;
      offset < steamAppIds.length;
      offset += STEAM_STORE_ITEMS_BATCH_SIZE
    ) {
      if (offset > 0) {
        await this.waitBetweenBatches();
      }

      const batch = steamAppIds.slice(
        offset,
        offset + STEAM_STORE_ITEMS_BATCH_SIZE,
      );
      const storeItems = await this.fetchStoreItemsOrThrow({
        steamAppIds: batch,
      });

      for (const storeItem of storeItems) {
        if (!isDefined(storeItem.appid)) {
          continue;
        }

        const tagVotes = Object.fromEntries(
          (storeItem.tags ?? []).flatMap((tag) => {
            const tagName = tagNamesById.get(tag.tagid);
            return isDefined(tagName) ? [[tagName, tag.weight]] : [];
          }),
        );

        tagVotesByAppId.set(String(storeItem.appid), tagVotes);
      }
    }

    return tagVotesByAppId;
  }

  private async loadTagNamesById(): Promise<Map<number, string>> {
    if (isDefined(this.tagNamesById)) {
      return this.tagNamesById;
    }

    const response = await fetchWithRetryOrThrow({ url: STEAM_TAG_LIST_URL });
    if (!response.ok) {
      throw new GameException(
        `Steam tag list request failed with ${response.status}`,
        'GAME_SOURCE_REQUEST_FAILED',
      );
    }

    const tagList = steamTagListResponseSchema.parse(await response.json());
    this.tagNamesById = new Map(
      tagList.response.tags.map((tag) => [tag.tagid, tag.name]),
    );

    return this.tagNamesById;
  }

  private async fetchStoreItemsOrThrow({
    steamAppIds,
  }: {
    steamAppIds: string[];
  }) {
    const inputJson = JSON.stringify({
      ids: steamAppIds.map((steamAppId) => ({ appid: Number(steamAppId) })),
      context: { language: 'english', country_code: 'US' },
      data_request: { include_tag_count: STEAM_STORE_ITEMS_TAG_COUNT },
    });

    const response = await fetchWithRetryOrThrow({
      url: `${STEAM_STORE_ITEMS_URL}?input_json=${encodeURIComponent(inputJson)}`,
    });
    if (!response.ok) {
      throw new GameException(
        `Steam store items request failed with ${response.status}`,
        'GAME_SOURCE_REQUEST_FAILED',
      );
    }

    const storeItemsResponse = steamStoreItemsResponseSchema.parse(
      await response.json(),
    );

    return storeItemsResponse.response.store_items ?? [];
  }

  private async waitBetweenBatches(): Promise<void> {
    await new Promise((resolve) =>
      setTimeout(resolve, STEAM_STORE_ITEMS_BATCH_INTERVAL_MS),
    );
  }
}
