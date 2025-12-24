import { type GameReview } from '../generated/prisma/client';
import { calculateAveragePerformance } from '../utils/calculateAveragePerformance';

export const calculateTranslationLayerStats = (reviews: GameReview[]) => {
  const layers = ['DXVK', 'DXMT', 'D3D_METAL', 'NONE'];
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
};
