import { CustomException } from '../../../engine/exceptions/custom.exception';

export type ReviewExceptionCode =
  | 'REVIEW_NOT_FOUND'
  | 'REVIEW_FORBIDDEN'
  | 'MAC_CONFIG_NOT_FOUND'
  | 'CONTENT_TYPE_INVALID'
  | 'CONFIRMATION_INVALID'
  | 'REVIEW_FETCH_FAILED'
  | 'REVIEW_CREATE_FAILED';

export class ReviewException extends CustomException<ReviewExceptionCode> {}
