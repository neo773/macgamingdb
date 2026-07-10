import { GAME_SOURCES } from '../constants/game-sources.constant';
import type { GameRef } from '../types/game-ref.type';

// Bare numeric refs predate multi-source support and always mean Steam appids;
// other sources use the "{source}-{externalId}" form.
export const parseGameRef = (identifier: string): GameRef | null => {
  if (/^[0-9]+$/.test(identifier)) {
    return { source: 'steam', externalId: identifier };
  }

  const prefixed = identifier.match(/^([a-z]+)-(.+)$/);
  if (prefixed) {
    const source = GAME_SOURCES.find((candidate) => candidate === prefixed[1]);
    if (source) {
      return { source, externalId: prefixed[2] };
    }
  }

  return null;
};
