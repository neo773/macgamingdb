import { CustomException } from '../../../engine/exceptions/custom.exception';

export type MacConfigExceptionCode =
  | 'SCRAPER_CREDENTIALS_MISSING'
  | 'POPULATE_MODE_INVALID';

export class MacConfigException extends CustomException<MacConfigExceptionCode> {}
