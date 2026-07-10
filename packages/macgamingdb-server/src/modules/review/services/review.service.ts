import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import {
  games,
  gameReviews,
  macConfigs,
  type ChipsetVariant,
  type GraphicsSetting,
  type PerformanceRating,
  type PlayMethod,
  type TranslationLayer,
} from '../../../drizzle/schema';
import {
  generateScreenshotKey,
  getPublicUrl,
  getUploadSignedUrl,
} from '../../../services/s3';
import { type MacSpecification } from '../../../scraper/EveryMacScraper';
import { calculateAveragePerformance } from '../../../utils/calculateAveragePerformance';
import { scoreToRating } from '../../../utils/scoreToRating';
import { resolveGame } from '../../../gameSources/resolveGame';
import { materializeGame } from '../../../gameSources/materializeGame';
import { parseGameRef } from '../../../gameSources/parseGameRef';
import { ReviewException } from '../exceptions/review.exception';
import { PageRevalidationService } from '../../../engine/core-modules/page-revalidation/page-revalidation.service';

const ALLOWED_UPLOAD_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

type CreateReviewParams = {
  userId: string;
  gameId: string;
  playMethod: PlayMethod;
  translationLayer?: TranslationLayer | null;
  performance: PerformanceRating;
  fps?: number | null;
  graphicsSettings: GraphicsSetting;
  resolution?: string;
  macConfigIdentifier: string;
  notes?: string;
  screenshots?: string[];
  softwareVersion?: string;
};

type UpdateReviewParams = {
  userId: string;
  reviewId: string;
  notes: string;
  performance?: PerformanceRating;
  fps?: number | null;
  resolution?: string | null;
  softwareVersion?: string | null;
  screenshots?: string[];
};

@Injectable()
export class ReviewService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB,
    private readonly pageRevalidationService: PageRevalidationService,
  ) {}

  private async updateGameAggregatedPerformance(gameId: string): Promise<void> {
    const reviews = await this.db
      .select({ performance: gameReviews.performance })
      .from(gameReviews)
      .where(eq(gameReviews.gameId, gameId));

    let aggregatedPerformance: PerformanceRating | null = null;
    if (reviews.length > 0) {
      const avgScore = calculateAveragePerformance(reviews);
      aggregatedPerformance = scoreToRating(avgScore);
    }

    await this.db
      .update(games)
      .set({ aggregatedPerformance })
      .where(eq(games.id, gameId));
  }

  async listMine(userId: string) {
    try {
      const reviews = await this.db.query.gameReviews.findMany({
        where: eq(gameReviews.userId, userId),
        with: {
          game: true,
          macConfig: true,
        },
        orderBy: desc(gameReviews.createdAt),
      });

      return reviews.map((review) => ({
        id: review.id,
        gameId: review.gameId,
        userId: review.userId,
        playMethod: review.playMethod,
        translationLayer: review.translationLayer,
        performance: review.performance,
        fps: review.fps,
        graphicsSettings: review.graphicsSettings,
        resolution: review.resolution,
        chipset: review.chipset,
        chipsetVariant: review.chipsetVariant,
        macConfigId: review.macConfigId,
        notes: review.notes,
        screenshots: review.screenshots,
        softwareVersion: review.softwareVersion,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        macConfig: review.macConfig,
        gameName: review.game.name,
        gameSlug: review.game.slug,
        gameHeaderImage: review.game.headerImage,
      }));
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      throw new ReviewException('Failed to fetch reviews', 'REVIEW_FETCH_FAILED');
    }
  }

  async getMacConfigs(input: {
    search?: string;
    selectedConfigIdentifier?: string;
  }) {
    try {
      const allMacConfigs = await this.db
        .select()
        .from(macConfigs)
        .orderBy(macConfigs.identifier);

      let configs = allMacConfigs.map((config) => {
        const metadata = JSON.parse(config.metadata) as MacSpecification;
        return {
          id: config.id,
          identifier: config.identifier,
          label: metadata.model,
          metadata,
          searchText: [
            metadata.model,
            metadata.chip,
            metadata.chipVariant,
            metadata.family,
          ]
            .join(' ')
            .toLowerCase(),
        };
      });

      if (input.search?.trim()) {
        const searchTerms = input.search
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean);
        configs = configs.filter((config) =>
          searchTerms.every((term) => config.searchText.includes(term)),
        );
      }

      const groupedConfigs: Record<string, typeof configs> = {};
      let selectedGroupKey: string | null = null;

      for (const config of configs) {
        const family = config.metadata.family;
        if (!groupedConfigs[family]) groupedConfigs[family] = [];
        groupedConfigs[family].push(config);

        if (config.identifier === input.selectedConfigIdentifier) {
          selectedGroupKey = family;
        }
      }

      for (const family of Object.keys(groupedConfigs)) {
        groupedConfigs[family].sort((a, b) => {
          if (a.identifier === input.selectedConfigIdentifier) return -1;
          if (b.identifier === input.selectedConfigIdentifier) return 1;
          return 0;
        });
      }

      const finalConfigs: typeof configs = [];

      if (selectedGroupKey && groupedConfigs[selectedGroupKey]) {
        finalConfigs.push(...groupedConfigs[selectedGroupKey]);
      }

      for (const [family, familyConfigs] of Object.entries(groupedConfigs)) {
        if (family !== selectedGroupKey) {
          finalConfigs.push(...familyConfigs);
        }
      }

      return finalConfigs.map(({ searchText: _searchText, ...config }) => config);
    } catch (error) {
      console.error('Error fetching Mac configs:', error);
      throw new ReviewException(
        'Failed to fetch Mac configurations',
        'REVIEW_FETCH_FAILED',
      );
    }
  }

  async getMacConfigById(identifier: string) {
    try {
      const macConfig = await this.db.query.macConfigs.findFirst({
        where: eq(macConfigs.identifier, identifier),
      });

      if (!macConfig) {
        return null;
      }

      const metadata = JSON.parse(macConfig.metadata) as MacSpecification;
      return {
        id: macConfig.id,
        identifier: macConfig.identifier,
        label: metadata.model,
        metadata,
      };
    } catch (error) {
      console.error('Error fetching Mac config:', error);
      throw new ReviewException(
        'Failed to fetch Mac configuration',
        'REVIEW_FETCH_FAILED',
      );
    }
  }

  async getUploadUrl(params: {
    userId: string;
    filename: string;
    contentType: string;
    gameId: string;
  }) {
    if (!ALLOWED_UPLOAD_TYPES.includes(params.contentType)) {
      throw new ReviewException(
        'Only PNG, JPG, WebP, and GIF files are allowed',
        'CONTENT_TYPE_INVALID',
      );
    }

    const key = generateScreenshotKey(
      params.userId,
      params.gameId,
      params.filename,
    );

    const signedUrl = await getUploadSignedUrl(key, params.contentType);
    const publicUrl = getPublicUrl(key);

    return { signedUrl, publicUrl, key };
  }

  async create(params: CreateReviewParams) {
    try {
      let game = await resolveGame(this.db, params.gameId);

      if (!game) {
        const ref = parseGameRef(params.gameId);
        game = ref
          ? await materializeGame(this.db, ref.source, ref.externalId)
          : null;
      }

      if (!game) {
        return null;
      }

      const macConfig = await this.db.query.macConfigs.findFirst({
        where: eq(macConfigs.identifier, params.macConfigIdentifier),
      });

      if (!macConfig) {
        throw new ReviewException('Mac config not found', 'MAC_CONFIG_NOT_FOUND');
      }

      const macConfigMetadata = JSON.parse(
        macConfig.metadata,
      ) as MacSpecification;
      const hasScreenshots =
        params.screenshots && params.screenshots.length > 0;

      const [review] = await this.db
        .insert(gameReviews)
        .values({
          gameId: game.id,
          userId: params.userId,
          playMethod: params.playMethod,
          translationLayer: params.translationLayer,
          performance: params.performance,
          fps: params.fps ?? null,
          graphicsSettings: params.graphicsSettings,
          resolution: params.resolution || null,
          macConfigId: macConfig.id,
          chipset: macConfigMetadata.chip,
          chipsetVariant: macConfigMetadata.chipVariant as ChipsetVariant,
          notes: params.notes || null,
          screenshots: hasScreenshots
            ? JSON.stringify(params.screenshots)
            : null,
          softwareVersion: params.softwareVersion || null,
        })
        .returning();

      await this.updateGameAggregatedPerformance(game.id);

      await this.db
        .update(games)
        .set({ reviewCount: sql`${games.reviewCount} + 1` })
        .where(eq(games.id, game.id));

      await this.pageRevalidationService.revalidatePaths({
        paths: [`/games/${game.slug ?? game.id}`, '/contributors'],
      });

      return { review };
    } catch (error) {
      console.error('Error creating review:', error);
      throw new ReviewException('Failed to create review', 'REVIEW_CREATE_FAILED');
    }
  }

  async updateReview(params: UpdateReviewParams) {
    const review = await this.db.query.gameReviews.findFirst({
      where: eq(gameReviews.id, params.reviewId),
      with: { game: true },
    });

    if (!review) {
      throw new ReviewException('Review not found', 'REVIEW_NOT_FOUND');
    }

    if (review.userId !== params.userId) {
      throw new ReviewException(
        'You can only update your own reviews',
        'REVIEW_FORBIDDEN',
      );
    }

    const updateData: Record<string, unknown> = {
      notes: params.notes.trim() || null,
    };

    if (params.performance !== undefined) {
      updateData.performance = params.performance;
    }

    if (params.fps !== undefined) {
      updateData.fps = params.fps;
    }

    if (params.resolution !== undefined) {
      updateData.resolution = params.resolution?.trim() || null;
    }

    if (params.softwareVersion !== undefined) {
      updateData.softwareVersion = params.softwareVersion?.trim() || null;
    }

    if (params.screenshots) {
      updateData.screenshots = JSON.stringify(params.screenshots);
    }

    await this.db
      .update(gameReviews)
      .set(updateData)
      .where(eq(gameReviews.id, params.reviewId));

    if (
      params.performance !== undefined &&
      params.performance !== review.performance
    ) {
      await this.updateGameAggregatedPerformance(review.gameId);
    }

    await this.pageRevalidationService.revalidatePaths({
      paths: [
        `/games/${review.game.slug ?? review.gameId}`,
        '/my-reviews',
        '/contributors',
      ],
    });

    return { success: true, message: 'Review updated successfully' };
  }

  async deleteReview(params: {
    userId: string;
    reviewId: string;
    confirmation: boolean;
  }) {
    const review = await this.db.query.gameReviews.findFirst({
      where: eq(gameReviews.id, params.reviewId),
      with: { game: true },
    });

    if (!review) {
      throw new ReviewException('Review not found', 'REVIEW_NOT_FOUND');
    }

    if (review.userId !== params.userId) {
      throw new ReviewException(
        'You can only delete your own reviews',
        'REVIEW_FORBIDDEN',
      );
    }

    if (!params.confirmation) {
      throw new ReviewException('Please confirm deletion', 'CONFIRMATION_INVALID');
    }

    await this.db.delete(gameReviews).where(eq(gameReviews.id, params.reviewId));

    await this.db
      .update(games)
      .set({ reviewCount: sql`${games.reviewCount} - 1` })
      .where(eq(games.id, review.gameId));

    await this.updateGameAggregatedPerformance(review.gameId);

    await this.pageRevalidationService.revalidatePaths({
      paths: [`/games/${review.game.slug ?? review.gameId}`],
    });

    return { success: true, message: 'Review deleted successfully' };
  }
}
