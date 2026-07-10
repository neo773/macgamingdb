import { createDrizzleClient } from 'macgamingdb-server/database';
import { createLogger } from 'macgamingdb-server/engine/core-modules/logger/create-logger';
import { games } from 'macgamingdb-server/drizzle/schema';
import { generateUniqueGameSlug } from 'macgamingdb-server/modules/game/utils/generate-unique-game-slug';
import { config } from 'dotenv';
import { and, eq, isNull, isNotNull } from 'drizzle-orm';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const db = createDrizzleClient();
const logger = createLogger('BackfillGameSlugs');

async function backfillGameSlugs() {
  const gamesToProcess = await db
    .select({ id: games.id, name: games.name, releaseYear: games.releaseYear })
    .from(games)
    .where(and(isNull(games.slug), isNotNull(games.name)));

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

  let updatedCount = 0;

  for (const game of gamesToProcess) {
    const slug = await generateUniqueGameSlug({
      name: game.name ?? '',
      releaseYear: game.releaseYear ?? undefined,
      fallbackId: game.id,
      isTaken,
    });

    assignedSlugs.add(slug);
    await db.update(games).set({ slug }).where(eq(games.id, game.id));
    updatedCount++;

    if (updatedCount % 500 === 0) {
      logger.log(`Progress: ${updatedCount}/${gamesToProcess.length}`);
    }
  }

  logger.log(`Done. Updated ${updatedCount} games.`);
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
