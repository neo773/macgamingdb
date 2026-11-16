import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { type RouterOutputs } from '@/modules/trpc/types/RouterOutputs';
import { type CrossOverPitch } from '@/modules/affiliate/types/CrossOverPitch';
import { PLAYABLE_PERFORMANCES } from '@/modules/affiliate/constants/PLAYABLE_PERFORMANCES';
import { computeMedian } from '@/modules/game/utils/computeMedian';

const MIN_PLAYABLE_SHARE = 0.5;

type GameReview = Pick<
  RouterOutputs['game']['getById']['reviews'][number],
  'playMethod' | 'performance' | 'fps'
>;

type BuildCrossOverPitchParams = {
  reviews: GameReview[];
};

const countPlayable = (reviews: GameReview[]) =>
  reviews.filter((review) => PLAYABLE_PERFORMANCES.has(review.performance))
    .length;

const isMostlyPlayable = (reviews: GameReview[]) =>
  reviews.length > 0 &&
  countPlayable(reviews) / reviews.length >= MIN_PLAYABLE_SHARE;

export const buildCrossOverPitch = ({
  reviews,
}: BuildCrossOverPitchParams): CrossOverPitch | undefined => {
  const crossOverReviews = reviews.filter(
    (review) => review.playMethod === 'CROSSOVER',
  );

  if (!isMostlyPlayable(crossOverReviews)) {
    return undefined;
  }

  return {
    reportCount: crossOverReviews.length,
    playableReportCount: countPlayable(crossOverReviews),
    medianFps: computeMedian(
      crossOverReviews.map((review) => review.fps).filter(isDefined),
    ),
  };
};
