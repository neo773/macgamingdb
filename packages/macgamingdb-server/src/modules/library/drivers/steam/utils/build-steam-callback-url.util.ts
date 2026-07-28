export const buildSteamCallbackUrl = ({
  requestUrl,
  origin,
}: {
  requestUrl: string;
  origin: string;
}): string => new URL(requestUrl, origin).toString();
