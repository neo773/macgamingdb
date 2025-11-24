import type { MetadataRoute } from 'next';
import { createPrismaClient } from '@/lib/database/prisma';

const CHUNK_SIZE = 200;

// Force dynamic rendering - don't pre-generate at build time
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prisma = createPrismaClient();

  // Get the total count of games with at least one review
  const totalGames = await prisma.game.count({
    where: {
      reviews: {
        some: {},
      },
    },
  });

  // Base URL for the site
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  const gameRoutes: MetadataRoute.Sitemap = [];

  // Fetch in chunks to avoid RESPONSE_TOO_LARGE
  for (let skip = 0; skip < totalGames; skip += CHUNK_SIZE) {
    const gamesWithReviews = await prisma.game.findMany({
      where: {
        reviews: {
          some: {},
        },
      },
      include: {
        reviews: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
      skip,
      take: CHUNK_SIZE,
    });

    gameRoutes.push(
      ...gamesWithReviews.map((game) => ({
        url: `${baseUrl}/games/${game.id}`,
        lastModified: game.reviews[0]?.updatedAt ?? undefined,
      })),
    );
  }

  return gameRoutes;
}
