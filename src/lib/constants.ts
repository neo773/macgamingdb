import { z } from "zod";
import { PerformanceEnum, ChipsetEnum, ChipsetVariantEnum } from "@/server/schema";

// URL parameter keys
export enum SearchURLParamsKeys {
  CHIPSET = "chipset",
  PERFORMANCE = "performance",
}

// Performance filter type
export type PerformanceFilter = "ALL" | z.infer<typeof PerformanceEnum>;

// Filter configuration type
export interface FilterConfig {
  limit: number;
  filter: PerformanceFilter;
  chipset?: z.infer<typeof ChipsetEnum>;
  chipsetVariant?: z.infer<typeof ChipsetVariantEnum>;
}

// Helper to create filter config from URL params
export function createFilterConfig(
  performanceParam: string | null | undefined,
  chipsetParam: string | null | undefined
): FilterConfig {
  const filter = (performanceParam || "ALL") as PerformanceFilter;
  const chipset = chipsetParam || "all";

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

  return config;
} 