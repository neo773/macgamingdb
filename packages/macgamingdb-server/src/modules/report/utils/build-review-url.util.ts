const PUBLIC_APP_URL = 'https://macgamingdb.app';

export const buildReviewUrl = (gameSlugOrId: string): string =>
  `${process.env.NEXT_PUBLIC_BASE_URL || PUBLIC_APP_URL}/games/${gameSlugOrId}`;
