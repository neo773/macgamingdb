import { z } from 'zod';
import {
  ChipsetVariantEnum,
  GraphicsSettingsEnum,
  PerformanceEnum,
  TranslationLayerEnum,
} from '../../../schema';
import { MacConfigRowSchema } from '../../mac-config/dtos/mac-config-row.dto';
import { PlayMethodWithOtherEnum } from '../../review/dtos/play-method-with-other.dto';

export const ContributorReviewSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  gameName: z.string().nullable(),
  gameSlug: z.string().nullable(),
  gameHeaderImage: z.string().nullable(),
  playMethod: PlayMethodWithOtherEnum,
  softwareVersion: z.string().nullable(),
  translationLayer: TranslationLayerEnum.nullable(),
  performance: PerformanceEnum,
  fps: z.number().nullable(),
  chipset: z.string(),
  chipsetVariant: ChipsetVariantEnum,
  graphicsSettings: GraphicsSettingsEnum.nullable(),
  resolution: z.string().nullable(),
  notes: z.string().nullable(),
  screenshots: z.string().nullable(),
  createdAt: z.string(),
  macConfig: MacConfigRowSchema.nullable(),
});
