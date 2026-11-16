import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { type RouterOutputs } from '@/modules/trpc/types/RouterOutputs';
import { STEAM_STORE_ASSETS_URL } from '@/modules/game/constants/STEAM_STORE_ASSETS_URL';

type BuildSteamLibraryCapsuleUrlParams = {
  sourceLinks: RouterOutputs['game']['getById']['game']['sourceLinks'];
};

export const buildSteamLibraryCapsuleUrl = ({
  sourceLinks,
}: BuildSteamLibraryCapsuleUrlParams): string | undefined => {
  const steamLink = sourceLinks.find((link) => link.source === 'steam');

  if (!isDefined(steamLink)) {
    return undefined;
  }

  return `${STEAM_STORE_ASSETS_URL}/${steamLink.externalId}/library_600x900.jpg`;
};
