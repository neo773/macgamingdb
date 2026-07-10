import { CustomException } from '../../../engine/exceptions/custom.exception';

export type ContributorExceptionCode =
  | 'CONTRIBUTOR_NOT_FOUND'
  | 'CONTRIBUTOR_FETCH_FAILED';

export class ContributorException extends CustomException<ContributorExceptionCode> {}
