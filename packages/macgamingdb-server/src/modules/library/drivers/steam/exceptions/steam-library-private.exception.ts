import { STEAM_LIBRARY_PRIVATE_CODE } from '../constants/steam-library-private-code.constant';

export class SteamLibraryPrivateError extends Error {
  constructor() {
    super(STEAM_LIBRARY_PRIVATE_CODE);
    this.name = 'SteamLibraryPrivateError';
  }
}
