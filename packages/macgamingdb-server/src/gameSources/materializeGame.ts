import { and, eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import type { DrizzleDB } from '../database/drizzle';
import { games, gameSourceLinks } from '../drizzle/schema';
import type { GameSource } from './GameSource';
import type { NormalizedGameDetails } from './NormalizedGameDetails';
import { gameSourceProviders } from './gameSourceProviders';
import { assignGameSlug } from './assignGameSlug';

type GameRow = typeof games.$inferSelect;

async function findGameByLink(
  db: DrizzleDB,
  source: GameSource,
  externalId: string,
): Promise<GameRow | null> {
  const link = await db.query.gameSourceLinks.findFirst({
    where: and(
      eq(gameSourceLinks.source, source),
      eq(gameSourceLinks.externalId, externalId),
    ),
    with: { game: true },
  });
  return link?.game ?? null;
}

async function linkGame(
  db: DrizzleDB,
  gameId: string,
  externalIds: NormalizedGameDetails['externalIds'],
): Promise<void> {
  for (const [source, externalId] of Object.entries(externalIds)) {
    await db
      .insert(gameSourceLinks)
      .values({ gameId, source: source as GameSource, externalId })
      .onConflictDoNothing();
  }
}

function gameColumnsFrom(details: NormalizedGameDetails) {
  return {
    name: details.name,
    headerImage: details.headerImage,
    descriptionHtml: details.descriptionHtml,
    website: details.website,
    releaseDate: details.releaseDate,
    releaseYear: details.releaseYear,
    developers: details.developers,
    publishers: details.publishers,
    genres: details.genres,
    screenshots: details.screenshots,
  };
}

export async function materializeGame(
  db: DrizzleDB,
  source: GameSource,
  externalId: string,
): Promise<GameRow | null> {
  const existing = await findGameByLink(db, source, externalId);
  if (existing?.name) {
    return existing;
  }

  let details: NormalizedGameDetails | null;
  try {
    details = await gameSourceProviders[source].fetchGame(externalId);
  } catch (error) {
    console.error(`${source} fetch for ${externalId} failed:`, error);
    details = null;
  }
  if (!details) {
    return existing;
  }

  // A game that exists on Steam is canonically the Steam entry, whichever
  // source it was discovered through.
  if (source !== 'steam' && details.externalIds.steam) {
    const canonical = await materializeGame(
      db,
      'steam',
      details.externalIds.steam,
    );
    if (canonical) {
      await linkGame(db, canonical.id, details.externalIds);
      return canonical;
    }
  }

  const gameId = existing?.id ?? createId();
  const slug =
    existing?.slug ??
    (await assignGameSlug(db, details.name, {
      releaseYear: details.releaseYear ?? undefined,
      fallbackId: externalId,
    }));

  await db
    .insert(games)
    .values({ id: gameId, slug, ...gameColumnsFrom(details) })
    .onConflictDoUpdate({
      target: games.id,
      set: gameColumnsFrom(details),
    });
  await linkGame(db, gameId, details.externalIds);

  // A concurrent materialization may have won the link insert; return the
  // winning row and discard this call's orphaned one.
  const persisted = await findGameByLink(db, source, externalId);
  if (persisted && persisted.id !== gameId && !existing) {
    await db.delete(games).where(eq(games.id, gameId));
  }
  return persisted;
}
