import { z } from 'zod';
import {
  ChipsetVariantEnum,
  GraphicsSettingsEnum,
  PerformanceEnum,
  TranslationLayerEnum,
} from '../../../schema';
import { PlayMethodWithOtherEnum } from './play-method-with-other.dto';

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
