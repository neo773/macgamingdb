const MAX_TITLE_LENGTH = 60;
const SUFFIX = ' on Mac – Apple Silicon FPS';
const SHORT_SUFFIX = ' on Mac';
const ELLIPSIS = '…';

export const buildGamePageTitle = (gameName: string): string => {
  const preferred = `${gameName}${SUFFIX}`;
  if (preferred.length <= MAX_TITLE_LENGTH) {
    return preferred;
  }

  const fallback = `${gameName}${SHORT_SUFFIX}`;
  if (fallback.length <= MAX_TITLE_LENGTH) {
    return fallback;
  }

  const room = MAX_TITLE_LENGTH - SHORT_SUFFIX.length - ELLIPSIS.length;
  return `${gameName.slice(0, room).trimEnd()}${ELLIPSIS}${SHORT_SUFFIX}`;
};
