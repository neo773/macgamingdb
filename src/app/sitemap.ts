import type { MetadataRoute } from 'next';
import { createDrizzleClient } from '@macgamingdb/server/database';
import { sql } from 'drizzle-orm';

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = createDrizzleClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const games = await db.all<{ id: string; lastModified: string }>(sql`
    SELECT g.id, MAX(r.updatedAt) as lastModified
    FROM Game g
    INNER JOIN GameReview r ON r.gameId = g.id
    GROUP BY g.id
  `);

  return games.map((game) => ({
    url: `${baseUrl}/games/${game.id}`,
    lastModified: new Date(game.lastModified),
  }));
}
