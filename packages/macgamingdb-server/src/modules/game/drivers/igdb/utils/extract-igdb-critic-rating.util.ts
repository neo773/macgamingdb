import { isDefined } from 'macgamingdb-shared/utils/isDefined';

import type { IgdbGameData } from '../types/igdb-game-data.type';

type IgdbCriticRating = {
  criticRating: number | null;
  criticRatingCount: number | null;
};

export const extractIgdbCriticRating = (
  data: Pick<IgdbGameData, 'aggregated_rating' | 'aggregated_rating_count'>,
): IgdbCriticRating => {
  const ratingCount = data.aggregated_rating_count ?? 0;

  if (!isDefined(data.aggregated_rating) || ratingCount < 1) {
    return { criticRating: null, criticRatingCount: null };
  }

  return {
    criticRating: Math.round(data.aggregated_rating),
    criticRatingCount: ratingCount,
  };
};
