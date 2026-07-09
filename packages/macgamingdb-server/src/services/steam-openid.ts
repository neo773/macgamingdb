import SteamSignIn from 'steam-signin';

export function buildSteamOpenIdRedirectUrl(
  returnTo: string,
  realm: string,
): string {
  return new SteamSignIn(realm).getUrl(returnTo);
}

export async function verifySteamOpenIdResponse(
  callbackUrl: string,
  realm: string,
): Promise<string> {
  const steamId = await new SteamSignIn(realm).verifyLogin(callbackUrl);
  return steamId.getSteamID64();
}
