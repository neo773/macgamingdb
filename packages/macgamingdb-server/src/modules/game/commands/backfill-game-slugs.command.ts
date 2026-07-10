import { Command, CommandRunner, Option } from 'nest-commander';
import { createLogger } from '../../../engine/core-modules/logger/create-logger.util';
import { GameSlugBackfillService } from '../services/game-slug-backfill.service';

const logger = createLogger('BackfillGameSlugs');

type BackfillGameSlugsOptions = {
  dryRun?: boolean;
};

@Command({
  name: 'backfill-game-slugs',
  description: 'Generate and persist a unique slug for every game missing one',
})
export class BackfillGameSlugsCommand extends CommandRunner {
  constructor(
    private readonly gameSlugBackfillService: GameSlugBackfillService,
  ) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: BackfillGameSlugsOptions,
  ): Promise<void> {
    const dryRun = options?.dryRun ?? false;
    const { updatedCount } =
      await this.gameSlugBackfillService.backfillMissingSlugs({ dryRun });

    logger.log(
      dryRun
        ? `[dry-run] Would update ${updatedCount} games with new slugs`
        : `Done. Updated ${updatedCount} games.`,
    );
  }

  @Option({
    flags: '--dry-run',
    description: 'Log what would change without writing',
  })
  parseDryRun(): boolean {
    return true;
  }
}
