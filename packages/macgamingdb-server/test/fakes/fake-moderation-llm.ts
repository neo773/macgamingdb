import { type ModerationVerdict } from '../../src/modules/report/dtos/moderation-verdict.dto';
import { type JudgeReviewParams } from '../../src/modules/report/types/judge-review-params.type';
import { type ModerationLlm } from '../../src/modules/report/types/moderation-llm.type';

export type FakeModerationLlm = ModerationLlm & {
  calls: JudgeReviewParams[];
  setVerdict: (verdict: ModerationVerdict) => void;
  setFailure: (error: Error) => void;
};

const DEFAULT_VERDICT: ModerationVerdict = {
  verdict: 'ok',
  category: 'none',
  confidence: 0.9,
  rationale: 'nothing wrong with this review',
};

export const createFakeModerationLlm = (): FakeModerationLlm => {
  const calls: JudgeReviewParams[] = [];
  let verdict: ModerationVerdict = DEFAULT_VERDICT;
  let failure: Error | null = null;

  return {
    calls,
    setVerdict: (nextVerdict: ModerationVerdict) => {
      verdict = nextVerdict;
      failure = null;
    },
    setFailure: (error: Error) => {
      failure = error;
    },
    judgeReview: async (params: JudgeReviewParams) => {
      calls.push(params);

      if (failure) {
        throw failure;
      }

      return verdict;
    },
  };
};
