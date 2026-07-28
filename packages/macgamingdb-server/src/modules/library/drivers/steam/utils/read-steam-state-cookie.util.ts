import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { STEAM_STATE_COOKIE_NAME } from '../constants/steam-state-cookie-name.constant';

export const readSteamStateCookie = ({
  cookieHeader,
}: {
  cookieHeader?: string;
}): string | undefined => {
  if (!isDefined(cookieHeader)) {
    return undefined;
  }

  const match = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${STEAM_STATE_COOKIE_NAME}=`));

  if (!isDefined(match)) {
    return undefined;
  }

  return decodeURIComponent(match.slice(STEAM_STATE_COOKIE_NAME.length + 1));
};
