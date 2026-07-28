import { type STEAM_LINK_OUTCOME } from '../constants/steam-link-outcome.constant';

export type SteamLinkOutcome =
  (typeof STEAM_LINK_OUTCOME)[keyof typeof STEAM_LINK_OUTCOME];
