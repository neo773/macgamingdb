import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, isNotNull } from 'drizzle-orm';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { games } from '../../../database/schema';
import { createLogger } from '../../../engine/core-modules/logger/create-logger.util';
import { generateUniqueGameSlug } from '../utils/generate-unique-game-slug.util';

const logger = createLogger('GameSlugBackfill');

@Injectable()
export class GameSlugBackfillService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB) {}

  async backfillMissingSlugs({
    dryRun,
  }: {
    dryRun: boolean;
  }): Promise<{ updatedCount: number }> {
    const gamesToProcess = await this.db
      .select({
        id: games.id,
        name: games.name,
        releaseYear: games.releaseYear,
      })
      .from(games)
      .where(and(isNull(games.slug), isNotNull(games.name)));

    logger.log(`Found ${gamesToProcess.length} games missing slugs`);

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
      return isDefined(existing);
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
        await this.db.update(games).set({ slug }).where(eq(games.id, game.id));
      }

      updatedCount++;

      if (updatedCount % 5000 === 0) {
        logger.log(`Progress: ${updatedCount}/${gamesToProcess.length}`);
      }
    }

    return { updatedCount };
  }
}
