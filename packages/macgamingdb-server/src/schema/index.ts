import { z } from 'zod';

import {
  CHIPSET_VARIANT_NAMES,
  CHIPSETS,
  GRAPHICS_SETTINGS,
  MAC_FAMILIES,
  PERFORMANCE_RATINGS,
  PLAY_METHODS,
  TRANSLATION_LAYERS,
} from './constants';

export {
  CHIPSET_VARIANTS,
  isValidChipsetVariant,
  SOFTWARE_VERSIONS,
} from './constants';

export const PlayMethodEnum = z.enum(PLAY_METHODS);
export const TranslationLayerEnum = z.enum(TRANSLATION_LAYERS);
export const PerformanceEnum = z.enum(PERFORMANCE_RATINGS);
export const MacFamilyEnum = z.enum(MAC_FAMILIES);
export const GraphicsSettingsEnum = z.enum(GRAPHICS_SETTINGS);
export const ChipsetEnum = z.enum(CHIPSETS);
export const ChipsetVariantEnum = z.enum(CHIPSET_VARIANT_NAMES);

export const MacFamily = MacFamilyEnum.Enum;
export const GraphicsSettings = GraphicsSettingsEnum.Enum;
export const Chipset = ChipsetEnum.Enum;
export const ChipsetVariant = ChipsetVariantEnum.Enum;

export const SoftwareVersionsSchema = z.object({
  CROSSOVER: z.array(z.string()),
  PARALLELS: z.array(z.string()),
});

export type SoftwareVersions = z.infer<typeof SoftwareVersionsSchema>;

export type MacFamily = z.infer<typeof MacFamilyEnum>;
export type PlayMethod = z.infer<typeof PlayMethodEnum>;
export type TranslationLayer = z.infer<typeof TranslationLayerEnum>;
export type Performance = z.infer<typeof PerformanceEnum>;
export type GraphicsSettings = z.infer<typeof GraphicsSettingsEnum>;
export type Chipset = z.infer<typeof ChipsetEnum>;
export type ChipsetVariant = z.infer<typeof ChipsetVariantEnum>;
