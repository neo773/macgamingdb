import { CustomException } from '../../../engine/exceptions/custom.exception';

export type ReportExceptionCode =
  | 'REVIEW_NOT_FOUND'
  | 'MODERATION_MISCONFIGURED'
  | 'MODERATION_FAILED'
  | 'DISCORD_MISCONFIGURED'
  | 'DISCORD_DISPATCH_FAILED'
  | 'DISCORD_SIGNATURE_INVALID';

export class ReportException extends CustomException<ReportExceptionCode> {}
