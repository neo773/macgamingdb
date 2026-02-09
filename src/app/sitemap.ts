import type { MetadataRoute } from 'next';
import { createPrismaClient } from '@macgamingdb/server/database';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prisma = createPrismaClient();
  const baseUrl = process.env.VERCEL_URL;

  try {
    const games = await prisma.$queryRaw<{ id: string; lastModified: string }[]>`
      SELECT g.id, MAX(r.updatedAt) as lastModified
      FROM Game g
      INNER JOIN GameReview r ON r.gameId = g.id
      GROUP BY g.id
    `;

    return games.map((game) => ({
      url: `${baseUrl}/games/${game.id}`,
      lastModified: new Date(game.lastModified),
    }));
  } finally {
    await prisma.$disconnect();
  }
}
