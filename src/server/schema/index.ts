import { z } from "zod";

export const PlayMethodEnum = z.enum(["NATIVE", "CROSSOVER", "PARALLELS"]);
export const TranslationLayerEnum = z.enum(["DXVK", "DXMT", "D3D_METAL", "NONE"]);
export const PerformanceEnum = z.enum([
  "EXCELLENT",
  "GOOD",
  "PLAYABLE",
  "BARELY_PLAYABLE",
  "UNPLAYABLE",
]);
export const GraphicsSettingsEnum = z.enum(["ULTRA", "HIGH", "MEDIUM", "LOW"]);
export const ChipsetEnum = z.enum(["M1", "M2", "M3", "M4"]);
export const ChipsetVariantEnum = z.enum(["BASE", "PRO", "MAX", "ULTRA"]);

export const SoftwareVersionsEnum = z.object({
  CROSSOVER: z.array(z.string()).default(["25.0", "24.0"]),
  PARALLELS: z.array(z.string()).default(["20", "19"]),
});

export type SoftwareVersions = z.infer<typeof SoftwareVersionsEnum>;

export type PlayMethod = z.infer<typeof PlayMethodEnum>;
export type TranslationLayer = z.infer<typeof TranslationLayerEnum>;
export type Performance = z.infer<typeof PerformanceEnum>;
export type GraphicsSettings = z.infer<typeof GraphicsSettingsEnum>;
export type Chipset = z.infer<typeof ChipsetEnum>;
export type ChipsetVariant = z.infer<typeof ChipsetVariantEnum>;
