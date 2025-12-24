import { type SteamAppData } from '@macgamingdb/server/api/steam';

interface GameStats {
  averagePerformance: number;
  totalReviews: number;
}

export function generateGameJsonLd(
  id: string,
  gameDetails: SteamAppData,
  stats: GameStats | null
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: gameDetails.name || 'Game',
    url: `https://macgamingdb.app/games/${id}`,
    gamePlatform: 'macOS',
    operatingSystem: 'macOS (Apple Silicon M1–M4)',
    applicationCategory: 'Game',
    description: gameDetails.detailed_description
      ? gameDetails.detailed_description.replace(/<[^>]*>?/gm, '')
      : 'Game details unavailable',
    image: gameDetails.header_image || '',
    publisher: gameDetails.publishers ? gameDetails.publishers[0] : '',
    sameAs: [
      gameDetails.website || '',
      gameDetails.steam_appid
        ? `https://store.steampowered.com/app/${gameDetails.steam_appid}`
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
