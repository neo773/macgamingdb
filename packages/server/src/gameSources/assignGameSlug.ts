import { eq } from 'drizzle-orm';
import type { DrizzleDB } from '../database/drizzle';
import { games } from '../drizzle/schema';
import { generateUniqueGameSlug } from '../utils/generateUniqueGameSlug';

export async function assignGameSlug(
  db: DrizzleDB,
  name: string,
  options: { releaseYear?: number; fallbackId: string },
): Promise<string> {
  return generateUniqueGameSlug(name, {
    releaseYear: options.releaseYear,
    fallbackId: options.fallbackId,
    isTaken: async (candidate) => {
      const [row] = await db
        .select({ id: games.id })
        .from(games)
        .where(eq(games.slug, candidate))
        .limit(1);
      return row !== undefined;
    },
  });
}
