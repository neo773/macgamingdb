import { type ModerationFailureStage } from '../../../types/moderation-failure-stage.type';

export type ModerationFailureAlertParams = {
  reviewId: string;
  gameName: string;
  reviewUrl: string;
  stage: ModerationFailureStage;
  failureMessage: string;
};
