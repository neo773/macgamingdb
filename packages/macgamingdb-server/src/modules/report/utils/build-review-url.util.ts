const DEFAULT_WEB_APP_URL = 'https://macgamingdb.com';

export const buildReviewUrl = (gameSlugOrId: string): string =>
  `${process.env.WEB_APP_URL ?? DEFAULT_WEB_APP_URL}/games/${gameSlugOrId}`;
