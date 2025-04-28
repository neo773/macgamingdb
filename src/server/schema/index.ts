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