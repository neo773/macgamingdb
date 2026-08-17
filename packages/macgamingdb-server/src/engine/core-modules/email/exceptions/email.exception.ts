import { CustomException } from '../../../exceptions/custom.exception';

export type EmailExceptionCode =
  | 'EMAIL_MISCONFIGURED'
  | 'EMAIL_DISPATCH_FAILED';

export class EmailException extends CustomException<EmailExceptionCode> {}
