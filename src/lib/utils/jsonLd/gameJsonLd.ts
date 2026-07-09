import { type RouterOutputs } from '@/lib/trpc/provider';

interface GameStats {
  averagePerformance: number;
  totalReviews: number;
}

export function generateGameJsonLd(
  identifier: string,
  game: RouterOutputs['game']['getById']['game'],
  stats: GameStats | null
) {
  const steamLink = game.sourceLinks.find((link) => link.source === 'steam');

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.name,
    url: `https://macgamingdb.app/games/${identifier}`,
    gamePlatform: 'macOS',
    operatingSystem: 'macOS (Apple Silicon M1–M4)',
    applicationCategory: 'Game',
    description: game.descriptionHtml
      ? game.descriptionHtml.replace(/<[^>]*>?/gm, '')
      : 'Game details unavailable',
    image: game.headerImage || '',
    publisher: game.publishers?.[0] ?? '',
    sameAs: [
      game.website || '',
      steamLink
        ? `https://store.steampowered.com/app/${steamLink.externalId}`
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
