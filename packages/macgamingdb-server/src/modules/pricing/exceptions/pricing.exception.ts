import { CustomException } from '../../../engine/exceptions/custom.exception';

export type PricingExceptionCode =
  | 'PRICING_MISCONFIGURED'
  | 'PRICING_REQUEST_FAILED';

export class PricingException extends CustomException<PricingExceptionCode> {}
