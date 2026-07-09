import { createDrizzleClient } from '@macgamingdb/server/database';
import { createLogger } from '@macgamingdb/server/utils/logger';
import { games } from '@macgamingdb/server/drizzle/schema';
import { generateUniqueGameSlug } from '@macgamingdb/server/utils/generateUniqueGameSlug';
import { extractReleaseYear } from '@macgamingdb/server/utils/extractReleaseYear';
import { config } from 'dotenv';
import { and, eq, isNull, isNotNull } from 'drizzle-orm';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const db = createDrizzleClient();
const logger = createLogger('BackfillGameSlugs');

function parseReleaseYear(details: Record<string, unknown>): number | undefined {
  const releaseDate = details.release_date;
  if (releaseDate === null || typeof releaseDate !== 'object') {
    return undefined;
  }

  const dateValue = (releaseDate as Record<string, unknown>).date;
  return typeof dateValue === 'string'
    ? extractReleaseYear(dateValue)
    : undefined;
}

async function backfillGameSlugs() {
  logger.log('Backfilling slugs for games with null slug and non-null details');

  const gamesToProcess = await db
    .select({ id: games.id, details: games.details })
    .from(games)
    .where(and(isNull(games.slug), isNotNull(games.details)));

  logger.log(`Found ${gamesToProcess.length} games to backfill`);

  const assignedSlugs = new Set<string>();

  const isTaken = async (slug: string): Promise<boolean> => {
    if (assignedSlugs.has(slug)) {
      return true;
    }
    const [existing] = await db
      .select({ id: games.id })
      .from(games)
      .where(eq(games.slug, slug))
      .limit(1);
    return existing !== undefined;
  };

  let processedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const game of gamesToProcess) {
    processedCount++;

    let details: Record<string, unknown> | null;
    try {
      details = JSON.parse(game.details as string) as Record<string, unknown>;
    } catch {
      details = null;
    }

    const name =
      details && typeof details.name === 'string' && details.name.trim() !== ''
        ? details.name
        : undefined;

    if (details === null || name === undefined) {
      skippedCount++;
      continue;
    }

    const releaseYear = parseReleaseYear(details);

    const slug = await generateUniqueGameSlug(name, {
      releaseYear,
      fallbackId: game.id,
      isTaken,
    });

    assignedSlugs.add(slug);
    await db.update(games).set({ slug }).where(eq(games.id, game.id));
    updatedCount++;

    if (processedCount % 100 === 0) {
      const progress = ((processedCount / gamesToProcess.length) * 100).toFixed(1);
      logger.log(
        `Progress: ${processedCount}/${gamesToProcess.length} (${progress}%) — updated ${updatedCount}, skipped ${skippedCount}`,
      );
    }
  }

  logger.log(
    `Done. Processed ${processedCount}, updated ${updatedCount}, skipped ${skippedCount} (no parseable name).`,
  );
}

async function main() {
  try {
    await backfillGameSlugs();
  } catch (error) {
    logger.error('Script failed', error instanceof Error ? error.stack : String(error));
    process.exit(1);
  }
}

main();
