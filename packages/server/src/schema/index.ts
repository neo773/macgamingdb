import { z } from 'zod';
import macConfigs from '../data/mac_configurations.json';

// We must assert the array length is at least 1 for z.enum
export const PlayMethodEnum = z.enum(macConfigs.playMethods as [string, ...string[]]);
export const TranslationLayerEnum = z.enum(macConfigs.translationLayers as [string, ...string[]]);
export const PerformanceEnum = z.enum(macConfigs.performance as [string, ...string[]]);

export const MacFamilyEnum = z.enum(macConfigs.families as [string, ...string[]]);
export const GraphicsSettingsEnum = z.enum(macConfigs.graphics as [string, ...string[]]);
export const ChipsetEnum = z.enum(macConfigs.chipsets as [string, ...string[]]);
export const ChipsetVariantEnum = z.enum(macConfigs.variants as [string, ...string[]]);

export const MacFamily = MacFamilyEnum.Enum;
export const GraphicsSettings = GraphicsSettingsEnum.Enum;
export const Chipset = ChipsetEnum.Enum;
export const ChipsetVariant = ChipsetVariantEnum.Enum;

export const SOFTWARE_VERSIONS = macConfigs.softwareVersions as Readonly<Record<string, string[]>>;

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
