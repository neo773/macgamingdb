import { and, eq } from 'drizzle-orm';
import type { DrizzleDB } from '../database/drizzle';
import { games, gameAliases, gameSourceLinks } from '../drizzle/schema';
import { parseGameRef } from './parseGameRef';

type GameRow = typeof games.$inferSelect;

export async function resolveGame(
  db: DrizzleDB,
  identifier: string,
): Promise<GameRow | null> {
  const bySlug = await db.query.games.findFirst({
    where: eq(games.slug, identifier),
  });
  if (bySlug) {
    return bySlug;
  }

  const alias = await db.query.gameAliases.findFirst({
    where: eq(gameAliases.aliasId, identifier),
  });
  if (alias) {
    const canonical = await db.query.games.findFirst({
      where: eq(games.id, alias.canonicalId),
    });
    if (canonical) {
      return canonical;
    }
  }

  const ref = parseGameRef(identifier);
  if (ref) {
    const link = await db.query.gameSourceLinks.findFirst({
      where: and(
        eq(gameSourceLinks.source, ref.source),
        eq(gameSourceLinks.externalId, ref.externalId),
      ),
      with: { game: true },
    });
    if (link?.game) {
      return link.game;
    }
  }

  const byId = await db.query.games.findFirst({
    where: eq(games.id, identifier),
  });
  return byId ?? null;
}
