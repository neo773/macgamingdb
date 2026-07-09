import { type NormalizedGameDetails } from '@macgamingdb/server/utils/normalizeGameDetails';

interface GameStats {
  averagePerformance: number;
  totalReviews: number;
}

export function generateGameJsonLd(
  identifier: string,
  gameDetails: NormalizedGameDetails,
  stats: GameStats | null
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: gameDetails.name || 'Game',
    url: `https://macgamingdb.app/games/${identifier}`,
    gamePlatform: 'macOS',
    operatingSystem: 'macOS (Apple Silicon M1–M4)',
    applicationCategory: 'Game',
    description: gameDetails.descriptionHtml
      ? gameDetails.descriptionHtml.replace(/<[^>]*>?/gm, '')
      : 'Game details unavailable',
    image: gameDetails.headerImage || '',
    publisher: gameDetails.publishers.length > 0 ? gameDetails.publishers[0] : '',
    sameAs: [
      gameDetails.website || '',
      gameDetails.steamAppId
        ? `https://store.steampowered.com/app/${gameDetails.steamAppId}`
        : '',
    ].filter(Boolean),
    aggregateRating: stats
      ? {
          '@type': 'AggregateRating',
          ratingValue: stats.averagePerformance?.toFixed(1) || '0',
          ratingCount: stats.totalReviews || 0,
        }
      : undefined,
  };
}
