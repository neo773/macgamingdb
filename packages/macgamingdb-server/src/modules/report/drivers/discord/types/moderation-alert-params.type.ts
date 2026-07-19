import { type ModerationVerdict } from '../../../dtos/moderation-verdict.dto';

export type ModerationAlertParams = {
  reviewId: string;
  gameName: string;
  gameHeaderImage?: string;
  reviewUrl: string;
  playMethod: string;
  translationLayer?: string;
  chipset: string;
  performance: string;
  notes: string;
  reportReason?: string;
  reporterName: string;
  verdict: ModerationVerdict;
};
