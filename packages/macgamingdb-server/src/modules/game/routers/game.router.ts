import { Inject } from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { Ctx, Input, Query, Router } from 'nestjs-trpc';
import {
  ChipsetEnum,
  ChipsetVariantEnum,
  PerformanceEnum,
  PlayMethodEnum,
  type Chipset,
  type ChipsetVariant,
  type PlayMethod,
} from '../../../schema';
import { CoverArtSchema } from '../dtos/cover-art.dto';
import { GameByIdSchema } from '../dtos/game-by-id.dto';
import { GamePricesSchema } from '../dtos/game-prices.dto';
import { GamesPageSchema } from '../dtos/games-page.dto';
import { GameSearchResultSchema } from '../dtos/game-search-result.dto';
import { RatingCountsSchema } from '../dtos/rating-counts.dto';
import { SitemapEntrySchema } from '../dtos/sitemap-entry.dto';
import { type PerformanceRating } from '../../../database/schema';
import { getRegion } from '../../../engine/utils/get-region.util';
import { GameService } from '../services/game.service';

const toHeaders = (request: Request): Headers => {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      headers.set(key, value.join(','));
    }
  }
  return headers;
};

@Router({ alias: 'game' })
export class GameRouter {
  constructor(@Inject(GameService) private readonly gameService: GameService) {}

  @Query({
    input: z.object({ query: z.string() }),
    output: z.array(GameSearchResultSchema),
    meta: {
      openapi: { method: 'GET', path: '/games/search', protect: false, tags: ['games'] },
    },
  })
  async search(@Input('query') query: string) {
    return this.gameService.search(query);
  }

  @Query({
    input: z.object({ gameId: z.string() }),
    output: CoverArtSchema,
    meta: {
      openapi: { method: 'GET', path: '/games/{gameId}/cover-art', protect: false, tags: ['games'] },
    },
  })
  async getCoverArt(@Input('gameId') gameId: string) {
    return this.gameService.getCoverArt(gameId);
  }

  @Query({
    input: z.object({
      chipset: ChipsetEnum.optional(),
      chipsetVariant: ChipsetVariantEnum.optional(),
      playMethod: z.enum(['ALL', ...PlayMethodEnum.options]).default('ALL'),
    }),
    output: RatingCountsSchema,
    meta: {
      openapi: { method: 'GET', path: '/games/filter-counts', protect: false, tags: ['games'] },
    },
  })
  async getFilterCounts(
    @Input()
    input: {
      chipset?: Chipset;
      chipsetVariant?: ChipsetVariant;
      playMethod: 'ALL' | PlayMethod;
    },
  ) {
    return this.gameService.getFilterCounts(input);
  }

  @Query({
    input: z.object({
      limit: z.number().min(1).max(50).default(6),
      cursor: z.number().min(0).default(0),
      performance: z.enum(['ALL', ...PerformanceEnum.options]).default('ALL'),
      chipset: ChipsetEnum.optional(),
      chipsetVariant: ChipsetVariantEnum.optional(),
      playMethod: z.enum(['ALL', ...PlayMethodEnum.options]).default('ALL'),
    }),
    output: GamesPageSchema,
    meta: {
      openapi: { method: 'GET', path: '/games', protect: false, tags: ['games'] },
    },
  })
  async getGames(
    @Input()
    input: {
      limit: number;
      cursor: number;
      performance: 'ALL' | PerformanceRating;
      chipset?: Chipset;
      chipsetVariant?: ChipsetVariant;
      playMethod: 'ALL' | PlayMethod;
    },
  ) {
    return this.gameService.getGames(input);
  }

  @Query({
    input: z.void(),
    output: z.array(SitemapEntrySchema),
    meta: {
      openapi: { method: 'GET', path: '/games/sitemap-entries', protect: false, tags: ['games'] },
    },
  })
  async getSitemapEntries() {
    return this.gameService.getSitemapEntries();
  }

  @Query({
    input: z.object({ id: z.string() }),
    output: GameByIdSchema,
    meta: {
      openapi: { method: 'GET', path: '/games/{id}', protect: false, tags: ['games'] },
    },
  })
  async getById(@Input('id') id: string) {
    return this.gameService.getById(id);
  }

  @Query({
    input: z.object({
      screenshots: z.preprocess(
        (value) => (typeof value === 'string' ? value.split(',') : value),
        z.array(z.string()),
      ),
    }),
    output: z.array(z.object({ original: z.string(), signed: z.string() })),
    meta: {
      openapi: { method: 'GET', path: '/screenshots/signed-urls', protect: false, tags: ['games'] },
    },
  })
  async getScreenshotSignedUrls(@Input('screenshots') screenshots: string[]) {
    return this.gameService.getScreenshotSignedUrls(screenshots);
  }

  @Query({
    input: z.object({ gameId: z.string() }),
    output: GamePricesSchema,
    meta: {
      openapi: { method: 'GET', path: '/games/{gameId}/prices', protect: false, tags: ['games'] },
    },
  })
  async getPrices(
    @Input('gameId') gameId: string,
    @Ctx() ctx: { req?: Request },
  ) {
    const region = ctx.req ? getRegion(toHeaders(ctx.req)) : 'us';
    return this.gameService.getPrices({ gameId, region });
  }
}
