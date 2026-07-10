import { type GameReview } from '../../../database/types';
import { calculateAveragePerformance } from './calculate-average-performance.util';

export const calculateTranslationLayerStats = (reviews: GameReview[]) => {
  const layers = ['DXVK', 'DXMT', 'D3D_METAL', 'NONE'];
  const stats: Record<string, { count: number; averagePerformance: number }> =
    {};

  layers.forEach((layer) => {
    const layerReviews = reviews.filter((review) => review.translationLayer === layer);
    stats[layer] = {
      count: layerReviews.length,
      averagePerformance: calculateAveragePerformance(layerReviews),
    };
  });

  return stats;
};
