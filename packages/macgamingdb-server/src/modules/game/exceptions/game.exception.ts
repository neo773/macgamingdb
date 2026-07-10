import { CustomException } from '../../../engine/exceptions/custom.exception';

export type GameExceptionCode =
  | 'GAME_NOT_FOUND'
  | 'COVER_ART_NOT_FOUND'
  | 'CHIPSET_VARIANT_INVALID'
  | 'GAME_FETCH_FAILED';

export class GameException extends CustomException<GameExceptionCode> {}
