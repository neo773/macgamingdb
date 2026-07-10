import { z } from 'zod';
import { PerformanceEnum } from '../../../schema';
import { GAME_SOURCES } from '../constants/game-sources.constant';
import { GameReviewWithMacConfigSchema } from '../../review/dtos/game-review-with-mac-config.dto';
import { GameStatsSchema } from '../../review/dtos/game-stats.dto';

export const GameByIdSchema = z.object({
  game: z.object({
    id: z.string(),
    slug: z.string().nullable(),
    name: z.string(),
    headerImage: z.string().nullable(),
    descriptionHtml: z.string().nullable(),
    website: z.string().nullable(),
    releaseDate: z.string().nullable(),
    releaseYear: z.number().nullable(),
    developers: z.array(z.string()).nullable(),
    publishers: z.array(z.string()).nullable(),
    genres: z.array(z.string()).nullable(),
    screenshots: z.array(z.string()).nullable(),
    sourceLinks: z.array(
      z.object({ source: z.enum(GAME_SOURCES), externalId: z.string() }),
    ),
    createdAt: z.string(),
    updatedAt: z.string(),
    aggregatedPerformance: PerformanceEnum.nullable(),
    reviewCount: z.number(),
  }),
  reviews: z.array(GameReviewWithMacConfigSchema),
  stats: GameStatsSchema.nullable(),
});
