import { Inject } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { and, asc, eq, gt, isNotNull, type SQL } from 'drizzle-orm';
import { isNonEmptyArray } from '@sniptt/guards';
import { deriveGenresFromSteamTags } from 'macgamingdb-shared/utils/deriveGenresFromSteamTags';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { games, gameSourceLinks } from '../../../database/schema';
import { createLogger } from '../../../engine/core-modules/logger/create-logger.util';
import { SteamStoreTagsService } from '../drivers/steam/services/steam-store-tags.service';

const logger = createLogger('BackfillGameGenresFromSteamTags');

const PAGE_SIZE = 1000;
const SAMPLE_SIZE = 10;

type BackfillGameGenresFromSteamTagsOptions = {
  dryRun?: boolean;
  reviewedOnly?: boolean;
};

@Command({
  name: 'backfill-game-genres-from-steam-tags',
  description:
    'Rebuild genres of Steam-linked games from Steam user tags, keeping current genres when no tag maps to a genre',
})
export class BackfillGameGenresFromSteamTagsCommand extends CommandRunner {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB,
    private readonly steamStoreTagsService: SteamStoreTagsService,
  ) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: BackfillGameGenresFromSteamTagsOptions,
  ): Promise<void> {
    const dryRun = options?.dryRun ?? false;
    const reviewedOnly = options?.reviewedOnly ?? false;

    const changes: Array<{
      gameId: string;
      name: string | null;
      before: string[];
      after: string[];
    }> = [];
    let untaggedCount = 0;
    let scannedCount = 0;
    let lastSeenGameId = '';

    for (;;) {
      const conditions: SQL[] = [
        eq(gameSourceLinks.source, 'steam'),
        gt(games.id, lastSeenGameId),
      ];
      if (reviewedOnly) {
        conditions.push(isNotNull(games.aggregatedPerformance));
      }

      const page = await this.db
        .select({
          gameId: games.id,
          name: games.name,
          genres: games.genres,
          steamAppId: gameSourceLinks.externalId,
        })
        .from(games)
        .innerJoin(gameSourceLinks, eq(gameSourceLinks.gameId, games.id))
        .where(and(...conditions))
        .orderBy(asc(games.id))
        .limit(PAGE_SIZE);

      if (!isNonEmptyArray(page)) {
        break;
      }

      scannedCount += page.length;
      lastSeenGameId = page[page.length - 1].gameId;

      const tagVotesByAppId =
        await this.steamStoreTagsService.fetchTagVotesByAppIds({
          steamAppIds: page.map((linkedGame) => linkedGame.steamAppId),
        });

      for (const linkedGame of page) {
        const before = linkedGame.genres ?? [];
        const after = deriveGenresFromSteamTags({
          tagVotes: tagVotesByAppId.get(linkedGame.steamAppId) ?? {},
        });

        if (!isNonEmptyArray(after)) {
          untaggedCount++;
          continue;
        }

        if (JSON.stringify(before) !== JSON.stringify(after)) {
          changes.push({
            gameId: linkedGame.gameId,
            name: linkedGame.name,
            before,
            after,
          });
        }
      }

      logger.log(`Fetched tags for ${scannedCount} Steam-linked games`);
    }

    logger.log(
      `${changes.length} games need new genres, ${untaggedCount} keep their current genres because no tag maps to a genre`,
    );

    if (isNonEmptyArray(changes)) {
      logger.log('Sample of pending changes:');
      changes.slice(0, SAMPLE_SIZE).forEach((change) => {
        logger.log(
          `  - ${change.name ?? change.gameId}: ${JSON.stringify(change.before)} -> ${JSON.stringify(change.after)}`,
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
        .where(eq(games.id, change.gameId));

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

  @Option({
    flags: '--reviewed-only',
    description: 'Only touch games that have at least one review',
  })
  parseReviewedOnly(): boolean {
    return true;
  }
}
