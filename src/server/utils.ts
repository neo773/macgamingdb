import { GameReview, PerformanceRating } from "@prisma/client";
import { ChipsetEnum, ChipsetVariantEnum } from "./schema";

export const getChipsetCombinations = () => {
  const combinations = [];
  for (const chipset of ChipsetEnum.options) {
    for (const variant of ChipsetVariantEnum.options) {
      combinations.push({
        value: `${chipset}-${variant}`,
        label: variant === "BASE" ? chipset : `${chipset} ${variant}`,
      });
    }
  }
  return combinations;
};

export const formatRatingLabel = (rating: string) => {
  switch (rating) {
    case "ALL":
      return "All Games";
    case "EXCELLENT":
      return "Excellent";
    case "GOOD":
      return "Good";
    case "BARELY_PLAYABLE":
      return "Barely Playable";
    case "PLAYABLE":
      return "Playable";
    case "UNPLAYABLE":
      return "Unplayable";
    default:
      return rating;
  }
};

// Helper function to calculate average performance
export const calculateAveragePerformance = (reviews: GameReview[]) => {
  const performanceMap: Record<PerformanceRating, number> = {
    UNPLAYABLE: 0,
    BARELY_PLAYABLE: 1,
    PLAYABLE: 2,
    GOOD: 3,
    EXCELLENT: 4,
  };

  const sum = reviews.reduce((acc, review) => {
    return (
      acc + performanceMap[review.performance as keyof typeof performanceMap]
    );
  }, 0);

  return reviews.length > 0 ? sum / reviews.length : 0;
}

// Helper function to calculate translation layer statistics
export const calculateTranslationLayerStats = (reviews: GameReview[]) => {
  const layers = ["DXVK", "DXMT", "D3D_METAL", "NONE"];
  const stats: Record<string, { count: number; averagePerformance: number }> =
    {};

  layers.forEach((layer) => {
    const layerReviews = reviews.filter((r) => r.translationLayer === layer);
    stats[layer] = {
      count: layerReviews.length,
      averagePerformance: calculateAveragePerformance(layerReviews),
    };
  });

  return stats;
}
