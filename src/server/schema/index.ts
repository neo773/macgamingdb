import { z } from 'zod';

export const PlayMethodEnum = z.enum(['NATIVE', 'CROSSOVER', 'PARALLELS']);
export const TranslationLayerEnum = z.enum([
  'DXVK',
  'DXMT',
  'D3D_METAL',
  'NONE',
]);
export const PerformanceEnum = z.enum([
  'EXCELLENT',
  'VERY_GOOD',
  'GOOD',
  'PLAYABLE',
  'BARELY_PLAYABLE',
  'UNPLAYABLE',
]);

export const MacFamilyEnum = z.enum([
  'MacBookAir',
  'MacBookPro',
  'iMac',
  'MacMini',
  'MacStudio',
  'MacPro',
]);
export const GraphicsSettingsEnum = z.enum(['ULTRA', 'HIGH', 'MEDIUM', 'LOW']);
export const ChipsetEnum = z.enum(['M1', 'M2', 'M3', 'M4', 'M5']);
export const ChipsetVariantEnum = z.enum(['BASE', 'PRO', 'MAX', 'ULTRA']);

export const MacFamily = MacFamilyEnum.Enum;
export const GraphicsSettings = GraphicsSettingsEnum.Enum;
export const Chipset = ChipsetEnum.Enum;
export const ChipsetVariant = ChipsetVariantEnum.Enum;

export const SOFTWARE_VERSIONS = {
  CROSSOVER: ['25.0.1', '25.0', '24.0'],
  PARALLELS: ['20', '19'],
} as const;

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
