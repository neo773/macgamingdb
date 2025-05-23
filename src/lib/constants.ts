import { z } from "zod";
import { PerformanceEnum, ChipsetEnum, ChipsetVariantEnum, PlayMethod, PlayMethodEnum } from "@/server/schema";

// URL parameter keys
export enum SearchURLParamsKeys {
  CHIPSET = "chipset",
  PERFORMANCE = "performance",
  PLAY_METHOD = "playMethod",
}

// Performance filter type
export type PerformanceFilter = "ALL" | z.infer<typeof PerformanceEnum>;
export type PlayMethodFilter = "ALL" | z.infer<typeof PlayMethodEnum>;
// Filter configuration type
export interface FilterConfig {
  limit: number;
  filter: PerformanceFilter;
  chipset?: z.infer<typeof ChipsetEnum>;
  chipsetVariant?: z.infer<typeof ChipsetVariantEnum>;
  playMethod?: PlayMethod;
}

// Helper to create filter config from URL params
export function createFilterConfig(
  performanceParam: string | null | undefined,
  chipsetParam: string | null | undefined,
  playMethodParam: string | null | undefined
): FilterConfig {
  const filter = (performanceParam || "ALL") as PerformanceFilter;
  const chipset = chipsetParam || "all";
  const playMethod = (playMethodParam || "ALL") as PlayMethodFilter;

  const config: FilterConfig = {
    limit: 6,
    filter,
  };

  if (chipset !== "all") {
    const [chipsetValue, variantValue] = chipset.split("-") as [
      z.infer<typeof ChipsetEnum>,
      z.infer<typeof ChipsetVariantEnum>
    ];
    config.chipset = chipsetValue;
    config.chipsetVariant = variantValue;
  }

  if (playMethod !== "ALL") {
    config.playMethod = playMethod;
  }

  return config;
} 