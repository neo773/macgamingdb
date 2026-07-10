import { MacConfigRowSchema } from '../../mac-config/dtos/mac-config-row.dto';
import { GameReviewSchema } from './game-review.dto';

export const GameReviewWithMacConfigSchema = GameReviewSchema.extend({
  macConfig: MacConfigRowSchema.nullable(),
});
