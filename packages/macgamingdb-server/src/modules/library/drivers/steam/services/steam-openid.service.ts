import { Injectable } from '@nestjs/common';
import SteamSignIn from 'steam-signin';

@Injectable()
export class SteamOpenIdService {
  buildRedirectUrl({
    returnTo,
    realm,
  }: {
    returnTo: string;
    realm: string;
  }): string {
    return new SteamSignIn(realm).getUrl(returnTo);
  }

  async verifyResponse({
    callbackUrl,
    realm,
  }: {
    callbackUrl: string;
    realm: string;
  }): Promise<string> {
    const steamId = await new SteamSignIn(realm).verifyLogin(callbackUrl);
    return steamId.getSteamID64();
  }
}
