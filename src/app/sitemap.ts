import type { MetadataRoute } from 'next';
import { createPrismaClient } from '@macgamingdb/server/database';

const CHUNK_SIZE = 200;

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prisma = createPrismaClient();

  const totalGames = await prisma.game.count({
    where: {
      reviews: {
        some: {},
      },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_URL;

  const gameRoutes: MetadataRoute.Sitemap = [];

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
