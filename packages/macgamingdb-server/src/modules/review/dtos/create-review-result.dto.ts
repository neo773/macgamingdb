import { z } from 'zod';
import { GameReviewSchema } from './game-review.dto';

export const CreateReviewResultSchema = z
  .object({ review: GameReviewSchema })
  .nullable();
