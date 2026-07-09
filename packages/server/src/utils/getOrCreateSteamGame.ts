import { eq } from 'drizzle-orm';
import { type DrizzleDB } from '../database/drizzle';
import { getGameBySteamId, type SteamAppData } from '../api/steam';
import { getIGDBGameBySteamAppId } from '../api/igdb';
import { games, gameReviews, gameAliases } from '../drizzle/schema';
import { generateUniqueGameSlug } from './generateUniqueGameSlug';
import { extractReleaseYear } from './extractReleaseYear';
import { calculateAveragePerformance } from './calculateAveragePerformance';
import { scoreToRating } from './scoreToRating';

type GameRow = typeof games.$inferSelect;
type DrizzleTransaction = Parameters<Parameters<DrizzleDB['transaction']>[0]>[0];

async function recomputeReviewStats(
  transaction: DrizzleTransaction,
  gameId: string,
): Promise<{ reviewCount: number; aggregatedPerformance: ReturnType<typeof scoreToRating> | null }> {
  const reviews = await transaction
    .select({ performance: gameReviews.performance })
    .from(gameReviews)
    .where(eq(gameReviews.gameId, gameId));

  const aggregatedPerformance =
    reviews.length > 0
      ? scoreToRating(calculateAveragePerformance(reviews))
      : null;

  return { reviewCount: reviews.length, aggregatedPerformance };
}

// Never throws: an IGDB outage must not break the Steam game flow.
async function reconcileWithIgdb(
  db: DrizzleDB,
  steamAppId: string,
  steamGameId: string,
): Promise<void> {
  try {
    const igdbGame = await getIGDBGameBySteamAppId(steamAppId);
    if (!igdbGame) {
      return;
    }

    const existingIgdbRow = await db.query.games.findFirst({
      where: eq(games.igdbId, igdbGame.id),
    });

    if (
      !existingIgdbRow ||
      existingIgdbRow.id === steamGameId ||
      existingIgdbRow.source !== 'igdb'
    ) {
      await db
        .update(games)
        .set({ igdbId: igdbGame.id })
        .where(eq(games.id, steamGameId));
      return;
    }

    await db.transaction(async (transaction) => {
      await transaction
        .update(gameReviews)
        .set({ gameId: steamGameId })
        .where(eq(gameReviews.gameId, existingIgdbRow.id));

      await transaction
        .update(gameAliases)
        .set({ canonicalId: steamGameId })
        .where(eq(gameAliases.canonicalId, existingIgdbRow.id));

      await transaction
        .insert(gameAliases)
        .values({ aliasId: existingIgdbRow.id, canonicalId: steamGameId })
        .onConflictDoNothing();

      if (existingIgdbRow.slug) {
        await transaction
          .insert(gameAliases)
          .values({ aliasId: existingIgdbRow.slug, canonicalId: steamGameId })
          .onConflictDoNothing();
      }

      await transaction
        .delete(games)
        .where(eq(games.id, existingIgdbRow.id));

      const { reviewCount, aggregatedPerformance } = await recomputeReviewStats(
        transaction,
        steamGameId,
      );

      await transaction
        .update(games)
        .set({ igdbId: igdbGame.id, reviewCount, aggregatedPerformance })
        .where(eq(games.id, steamGameId));
    });
  } catch (error) {
    console.error(
      `IGDB reconcile for Steam app ${steamAppId} failed (non-fatal):`,
      error,
    );
  }
}

export async function getOrCreateSteamGame(
  db: DrizzleDB,
  steamAppId: string,
): Promise<GameRow | null> {
  const existing = await db.query.games.findFirst({
    where: eq(games.id, steamAppId),
  });

  if (existing && existing.details) {
    return existing;
  }

  let steamData: SteamAppData | null;
  try {
    steamData = await getGameBySteamId(steamAppId);
  } catch {
    steamData = null;
  }

  if (!steamData) {
    return existing ?? null;
  }

  const gameDetails = JSON.stringify(steamData);

  const isTaken = async (candidate: string): Promise<boolean> => {
    const [row] = await db
      .select({ id: games.id })
      .from(games)
      .where(eq(games.slug, candidate))
      .limit(1);
    return row !== undefined && row.id !== steamAppId;
  };

  const slug =
    existing?.slug ??
    (await generateUniqueGameSlug(steamData.name, {
      releaseYear: extractReleaseYear(steamData.release_date?.date),
      fallbackId: steamAppId,
      isTaken,
    }));

  await db
    .insert(games)
    .values({
      id: steamAppId,
      slug,
      details: gameDetails,
      source: 'steam',
    })
    .onConflictDoUpdate({
      target: games.id,
      set: { details: gameDetails, slug, source: 'steam' },
    });

  if (!existing) {
    await reconcileWithIgdb(db, steamAppId, steamAppId);
  }

  const persisted = await db.query.games.findFirst({
    where: eq(games.id, steamAppId),
  });

  return persisted ?? null;
}
