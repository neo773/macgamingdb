import { Inject } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { sql } from 'drizzle-orm';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { isNonEmptyArray } from '@sniptt/guards';
import { DRIZZLE_CLIENT } from '../constants/drizzle-client.constant';
import { type DrizzleDB } from '../drizzle';
import { createLogger } from '../../engine/core-modules/logger/create-logger.util';
import { GameSlugBackfillService } from '../../modules/game/services/game-slug-backfill.service';

const logger = createLogger('MigrateDatabase');

const MIGRATIONS_FOLDER = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'drizzle',
  'migrations',
);

type MigrateDatabaseOptions = {
  dryRun?: boolean;
};

type CountRow = { value: number };

@Command({
  name: 'migrate-database',
  description:
    'Apply pending schema migrations, backfill slugs, and validate invariants',
})
export class MigrateDatabaseCommand extends CommandRunner {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB,
    private readonly gameSlugBackfillService: GameSlugBackfillService,
  ) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: MigrateDatabaseOptions,
  ): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    const beforeCounts = await this.readCoreCounts();
    logger.log(
      `Before: games=${beforeCounts.games} reviews=${beforeCounts.reviews} users=${beforeCounts.users} macConfigs=${beforeCounts.macConfigs}`,
    );

    const pendingSummary = await this.describePendingMigrations();
    logger.log(
      isNonEmptyArray(pendingSummary)
        ? `Pending migrations: ${pendingSummary.join(', ')}`
        : 'Pending migrations: none',
    );

    if (dryRun) {
      const { updatedCount } =
        await this.gameSlugBackfillService.backfillMissingSlugs({
          dryRun: true,
        });
      logger.log(
        `[dry-run] Would apply ${pendingSummary.length} migrations and assign ${updatedCount} slugs`,
      );
      return;
    }

    await this.applyPendingMigrations();
    logger.log('Schema migrations applied');

    const { updatedCount } =
      await this.gameSlugBackfillService.backfillMissingSlugs({
        dryRun: false,
      });
    logger.log(`Slugs assigned: ${updatedCount}`);

    await this.validateOrThrow(beforeCounts);
    logger.log('Validation passed');
  }

  private async readCoreCounts() {
    const [games] = await this.db.all<CountRow>(
      sql`SELECT count(*) AS value FROM Game`,
    );
    const [reviews] = await this.db.all<CountRow>(
      sql`SELECT count(*) AS value FROM GameReview`,
    );
    const [users] = await this.db.all<CountRow>(
      sql`SELECT count(*) AS value FROM user`,
    );
    const [macConfigs] = await this.db.all<CountRow>(
      sql`SELECT count(*) AS value FROM MacConfig`,
    );
    return {
      games: games.value,
      reviews: reviews.value,
      users: users.value,
      macConfigs: macConfigs.value,
    };
  }

  private readPendingJournalEntries = async () => {
    const journalEntries = await this.db.all<{ hash: string }>(
      sql`SELECT hash FROM __drizzle_migrations`,
    );
    const appliedCount = journalEntries.length;
    const journalSchema = z.object({
      entries: z.array(z.object({ tag: z.string(), when: z.number() })),
    });
    const journal = journalSchema.parse(
      JSON.parse(
        readFileSync(path.join(MIGRATIONS_FOLDER, 'meta', '_journal.json'), 'utf-8'),
      ),
    );
    return journal.entries.slice(appliedCount);
  };

  private async describePendingMigrations(): Promise<string[]> {
    const pendingEntries = await this.readPendingJournalEntries();
    return pendingEntries.map((entry) => entry.tag);
  }

  // Statements run individually because sqld enforces a timeout on
  // interactive transactions that the bulk data migration cannot fit inside.
  private async applyPendingMigrations(): Promise<void> {
    const pendingEntries = await this.readPendingJournalEntries();

    for (const entry of pendingEntries) {
      const migrationSql = readFileSync(
        path.join(MIGRATIONS_FOLDER, `${entry.tag}.sql`),
        'utf-8',
      );
      const statements = migrationSql
        .split('--> statement-breakpoint')
        .map((statement) => statement.trim())
        .filter((statement) => statement !== '');

      for (const statement of statements) {
        try {
          await this.db.run(sql.raw(statement));
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (/duplicate column|already exists|no such column|no such index/i.test(message)) {
            logger.warn(`Skipping already-applied statement in ${entry.tag}: ${message}`);
            continue;
          }
          throw error;
        }
      }

      const migrationHash = createHash('sha256').update(migrationSql).digest('hex');
      await this.db.run(
        sql`INSERT INTO __drizzle_migrations (hash, created_at) VALUES (${migrationHash}, ${entry.when})`,
      );
      logger.log(`Applied migration ${entry.tag}`);
    }
  }

  private async validateOrThrow(beforeCounts: {
    games: number;
    reviews: number;
    users: number;
    macConfigs: number;
  }): Promise<void> {
    const afterCounts = await this.readCoreCounts();
    this.assertEqual('game count', beforeCounts.games, afterCounts.games);
    this.assertEqual('review count', beforeCounts.reviews, afterCounts.reviews);
    this.assertEqual('user count', beforeCounts.users, afterCounts.users);
    this.assertEqual(
      'mac config count',
      beforeCounts.macConfigs,
      afterCounts.macConfigs,
    );

    const legacyColumns = await this.db.all<{ name: string }>(
      sql`SELECT name FROM pragma_table_info('Game') WHERE name IN ('details', 'source', 'igdbId')`,
    );
    this.assertEqual('legacy Game columns remaining', 0, legacyColumns.length);

    const [named] = await this.db.all<CountRow>(
      sql`SELECT count(*) AS value FROM Game WHERE name IS NOT NULL`,
    );
    const [slugged] = await this.db.all<CountRow>(
      sql`SELECT count(*) AS value FROM Game WHERE slug IS NOT NULL`,
    );
    this.assertEqual('named games all slugged', named.value, slugged.value);

    const [duplicateSlugs] = await this.db.all<CountRow>(
      sql`SELECT count(*) AS value FROM (SELECT slug FROM Game WHERE slug IS NOT NULL GROUP BY slug HAVING count(*) > 1)`,
    );
    this.assertEqual('duplicate slugs', 0, duplicateSlugs.value);

    const [linked] = await this.db.all<CountRow>(
      sql`SELECT count(DISTINCT gameId) AS value FROM GameSourceLink`,
    );
    this.assertEqual(
      'games with a source link',
      afterCounts.games,
      linked.value,
    );

    const [orphanReviews] = await this.db.all<CountRow>(
      sql`SELECT count(*) AS value FROM GameReview r LEFT JOIN Game g ON g.id = r.gameId WHERE g.id IS NULL`,
    );
    this.assertEqual('orphaned reviews', 0, orphanReviews.value);

    const [shells] = await this.db.all<CountRow>(
      sql`SELECT count(*) AS value FROM Game WHERE name IS NULL`,
    );
    if (shells.value > 0) {
      logger.warn(
        `${shells.value} shell games have no name (had no details before migration); they resolve by id only`,
      );
    }
  }

  private assertEqual(label: string, expected: number, actual: number): void {
    if (expected !== actual) {
      throw new Error(
        `Validation failed — ${label}: expected ${expected}, got ${actual}`,
      );
    }
  }

  @Option({
    flags: '--dry-run',
    description: 'Report pending work without writing',
  })
  parseDryRun(): boolean {
    return true;
  }
}
