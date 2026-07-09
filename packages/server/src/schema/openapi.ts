import { z } from 'zod';
import { GAME_SOURCES } from '../gameSources/GameSource';
import {
  ChipsetVariantEnum,
  GraphicsSettingsEnum,
  PerformanceEnum,
  PlayMethodEnum,
  TranslationLayerEnum,
} from './index';

// DB rows may contain legacy 'OTHER' play methods not accepted by review inputs
export const PlayMethodWithOtherEnum = z.enum([
  ...PlayMethodEnum.options,
  'OTHER',
]);

// ─── Shared output schemas for the OpenAPI (REST) surface ────────────────────
// These describe what the procedures actually return today. They are used both
// for runtime output validation on REST requests and to generate openapi.json.

export const SteamSearchResultSchema = z.object({
  objectID: z.string(),
  name: z.string(),
  url: z.string(),
  tagIds: z.array(z.string()).optional(),
});

export const GameSearchResultSchema = z.object({
  objectID: z.string(),
  name: z.string(),
  url: z.string(),
  tagIds: z.array(z.string()).optional(),
  source: z.enum(GAME_SOURCES),
  igdbId: z.number().optional(),
  coverImage: z.string().optional(),
  slug: z.string().nullable().optional(),
  releaseYear: z.number().optional(),
});

export const MaterializeFromIgdbResultSchema = z.object({
  id: z.string(),
  slug: z.string().nullable(),
});

export const CoverArtSchema = z.object({
  headerImage: z.string(),
  capsuleImage: z.string().optional(),
  capsuleImagev5: z.string().optional(),
});

export const RatingCountsSchema = z.object({
  ALL: z.number(),
  EXCELLENT: z.number(),
  VERY_GOOD: z.number(),
  GOOD: z.number(),
  PLAYABLE: z.number(),
  BARELY_PLAYABLE: z.number(),
  UNPLAYABLE: z.number(),
});

export const GameListItemSchema = z.object({
  id: z.string(),
  slug: z.string().nullable(),
  source: z.enum(GAME_SOURCES),
  details: z.string().nullable(),
  performanceRating: PerformanceEnum,
});

export const GamesPageSchema = z.object({
  games: z.array(GameListItemSchema),
  hasNextPage: z.boolean(),
  nextOffset: z.number().optional(),
});

export const MacSpecificationSchema = z.object({
  family: z.string(),
  model: z.string(),
  identifier: z.string(),
  chip: z.string(),
  chipVariant: z.string(),
  cpuCores: z.number(),
  gpuCores: z.number(),
  ram: z.number(),
  year: z.number(),
});

export const MacConfigRowSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  metadata: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MacConfigSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  label: z.string(),
  metadata: MacSpecificationSchema,
});

export const GameReviewSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  userId: z.string(),
  playMethod: PlayMethodWithOtherEnum,
  translationLayer: TranslationLayerEnum.nullable(),
  performance: PerformanceEnum,
  fps: z.number().nullable(),
  graphicsSettings: GraphicsSettingsEnum.nullable(),
  resolution: z.string().nullable(),
  chipset: z.string(),
  chipsetVariant: ChipsetVariantEnum,
  macConfigId: z.string().nullable(),
  notes: z.string().nullable(),
  screenshots: z.string().nullable(),
  softwareVersion: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export const GameReviewWithMacConfigSchema = GameReviewSchema.extend({
  macConfig: MacConfigRowSchema.nullable(),
});

export const MyReviewSchema = GameReviewWithMacConfigSchema.extend({
  gameDetails: z.string().nullable(),
});

export const MyReviewsSchema = z.array(MyReviewSchema);

export const GameStatsSchema = z.object({
  totalReviews: z.number(),
  methods: z.object({
    native: z.number(),
    crossover: z.number(),
    parallels: z.number(),
    other: z.number(),
  }),
  averagePerformance: z.number(),
  translationLayers: z.record(
    z.string(),
    z.object({ count: z.number(), averagePerformance: z.number() }),
  ),
});

export const GameByIdSchema = z.object({
  game: z.object({
    // Fields are optional because a game may not exist in the DB yet —
    // in that case only `details` (freshly fetched from Steam) is present.
    id: z.string().optional(),
    slug: z.string().nullable().optional(),
    source: z.string().optional(),
    igdbId: z.number().nullable().optional(),
    details: z.string(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    aggregatedPerformance: PerformanceEnum.nullable().optional(),
    reviewCount: z.number().optional(),
  }),
  reviews: z.array(GameReviewWithMacConfigSchema),
  stats: GameStatsSchema.nullable(),
});

export const GamePricesSchema = z
  .object({
    title: z.string(),
    url: z.string(),
    prices: z.object({
      currentRetail: z.string(),
      currentKeyshops: z.string(),
      historicalRetail: z.string(),
      historicalKeyshops: z.string(),
      currency: z.string(),
    }),
  })
  .nullable();

export const ContributorSchema = z.object({
  id: z.string(),
  name: z.string(),
  joinedAt: z.string(),
  reviewCount: z.number(),
  uniqueGamesCount: z.number(),
  score: z.number(),
});

export const ContributorsPageSchema = z.object({
  contributors: z.array(ContributorSchema),
  nextCursor: z.number().nullable(),
  totalCount: z.number(),
});

export const ContributorReviewSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  gameName: z.string().optional(),
  gameDetails: z.string().nullable(),
  playMethod: PlayMethodWithOtherEnum,
  softwareVersion: z.string().nullable(),
  translationLayer: TranslationLayerEnum.nullable(),
  performance: PerformanceEnum,
  fps: z.number().nullable(),
  graphicsSettings: GraphicsSettingsEnum.nullable(),
  resolution: z.string().nullable(),
  notes: z.string().nullable(),
  screenshots: z.string().nullable(),
  createdAt: z.string(),
  macConfig: MacConfigRowSchema.nullable(),
});

export const ContributorDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  joinedAt: z.string(),
  reviewCount: z.number(),
  uniqueGamesCount: z.number(),
  reviews: z.array(ContributorReviewSchema),
});

export const CreateReviewResultSchema = z
  .object({ review: GameReviewSchema })
  .nullable();

export const MutationResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const UploadUrlSchema = z.object({
  signedUrl: z.string(),
  publicUrl: z.string(),
  key: z.string(),
});

export const LibraryStatusSchema = z.object({
  linked: z.boolean(),
  provider: z.string().optional(),
  externalUserId: z.string().optional(),
  lastSyncedAt: z.string().nullable().optional(),
});

export const LibrarySyncResultSchema = z.object({
  count: z.number(),
  syncedAt: z.string(),
});

export const LibraryEntrySchema = z.object({
  externalGameId: z.string(),
  name: z.string().nullable(),
  iconHash: z.string().nullable(),
  playtimeMinutes: z.number(),
  aggregatedPerformance: PerformanceEnum.nullable(),
  reviewCount: z.number(),
  hasData: z.boolean(),
});

export const LibraryLinkUrlSchema = z.object({
  url: z.string(),
});

export const OkResultSchema = z.object({
  ok: z.boolean(),
});
