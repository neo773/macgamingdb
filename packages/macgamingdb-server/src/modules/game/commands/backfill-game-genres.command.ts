import { Inject } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { eq } from 'drizzle-orm';
import { isNonEmptyArray } from '@sniptt/guards';
import { normalizeGenres } from 'macgamingdb-shared/utils/normalizeGenres';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { games } from '../../../database/schema';
import { createLogger } from '../../../engine/core-modules/logger/create-logger.util';

const logger = createLogger('BackfillGameGenres');

const SAMPLE_SIZE = 10;

type BackfillGameGenresOptions = {
  dryRun?: boolean;
};

@Command({
  name: 'backfill-game-genres',
  description:
    'Collapse localized and duplicate genre labels onto the canonical vocabulary',
})
export class BackfillGameGenresCommand extends CommandRunner {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: BackfillGameGenresOptions,
  ): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    const allGames = await this.db
      .select({ id: games.id, name: games.name, genres: games.genres })
      .from(games);

    logger.log(`Scanning ${allGames.length} games`);

    const changes = allGames
      .map((game) => ({
        id: game.id,
        name: game.name,
        before: game.genres ?? [],
        after: normalizeGenres(game.genres ?? []),
      }))
      .filter(
        (change) =>
          JSON.stringify(change.before) !== JSON.stringify(change.after),
      );

    logger.log(`${changes.length} games need their genres rewritten`);

    const emptied = changes.filter((change) => !isNonEmptyArray(change.after));
    if (isNonEmptyArray(emptied)) {
      logger.warn(
        `${emptied.length} games will end up with no genres at all (their labels were storefront tags, not genres)`,
      );
    }

    if (isNonEmptyArray(changes)) {
      logger.log('Sample of pending changes:');
      changes.slice(0, SAMPLE_SIZE).forEach((change) => {
        logger.log(
          `  - ${change.name ?? change.id}: ${JSON.stringify(change.before)} -> ${JSON.stringify(change.after)}`,
        );
      });
    }

    if (dryRun) {
      logger.log(`[dry-run] Would rewrite genres on ${changes.length} games`);
      return;
    }

    let processedCount = 0;

    for (const change of changes) {
      await this.db
        .update(games)
        .set({ genres: change.after })
        .where(eq(games.id, change.id));

      processedCount++;
      if (processedCount % 100 === 0) {
        logger.log(`Progress: ${processedCount}/${changes.length}`);
      }
    }

    logger.log(`Rewrote genres on ${processedCount} games`);
  }

  @Option({
    flags: '--dry-run',
    description: 'Log what would change without writing',
  })
  parseDryRun(): boolean {
    return true;
  }
}
