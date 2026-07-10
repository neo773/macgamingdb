import { Inject } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { and, eq, isNull, isNotNull } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { games } from '../../../database/schema';
import { createLogger } from '../../../engine/core-modules/logger/create-logger.util';
import { generateUniqueGameSlug } from '../utils/generate-unique-game-slug.util';

const logger = createLogger('BackfillGameSlugs');

type BackfillGameSlugsOptions = {
  dryRun?: boolean;
};

@Command({
  name: 'backfill-game-slugs',
  description: 'Generate and persist a unique slug for every game missing one',
})
export class BackfillGameSlugsCommand extends CommandRunner {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: BackfillGameSlugsOptions,
  ): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    const gamesToProcess = await this.db
      .select({
        id: games.id,
        name: games.name,
        releaseYear: games.releaseYear,
      })
      .from(games)
      .where(and(isNull(games.slug), isNotNull(games.name)));

    logger.log(`Found ${gamesToProcess.length} games to backfill`);

    const assignedSlugs = new Set<string>();

    const isTaken = async (slug: string): Promise<boolean> => {
      if (assignedSlugs.has(slug)) {
        return true;
      }
      const [existing] = await this.db
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

      if (!dryRun) {
        await this.db
          .update(games)
          .set({ slug })
          .where(eq(games.id, game.id));
      }

      updatedCount++;

      if (updatedCount % 500 === 0) {
        logger.log(`Progress: ${updatedCount}/${gamesToProcess.length}`);
      }
    }

    if (dryRun) {
      logger.log(`[dry-run] Would update ${updatedCount} games with new slugs`);
      return;
    }

    logger.log(`Done. Updated ${updatedCount} games.`);
  }

  @Option({
    flags: '--dry-run',
    description: 'Log what would change without writing',
  })
  parseDryRun(): boolean {
    return true;
  }
}
