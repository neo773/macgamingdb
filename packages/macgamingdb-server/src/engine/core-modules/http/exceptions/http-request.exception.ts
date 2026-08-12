import { CustomException } from '../../../exceptions/custom.exception';

export type HttpRequestExceptionCode =
  | 'HTTP_REQUEST_TIMED_OUT'
  | 'HTTP_REQUEST_ABORTED'
  | 'HTTP_REQUEST_NETWORK_ERROR';

export class HttpRequestException extends CustomException<HttpRequestExceptionCode> {}
