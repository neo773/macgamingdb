import { CustomException } from '../../../engine/exceptions/custom.exception';

export type LibraryExceptionCode = 'STEAM_LIBRARY_PRIVATE_PRECONDITION_FAILED';

export class LibraryException extends CustomException<LibraryExceptionCode> {}
