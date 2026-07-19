import { type ModerationVerdict } from '../dtos/moderation-verdict.dto';
import { type JudgeReviewParams } from './judge-review-params.type';

export type ModerationLlm = {
  judgeReview(params: JudgeReviewParams): Promise<ModerationVerdict>;
};
