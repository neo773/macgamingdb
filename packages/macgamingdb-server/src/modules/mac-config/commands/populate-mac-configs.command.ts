
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Inject } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { DRIZZLE_CLIENT } from '../../../database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../../database/drizzle';
import { macConfigs } from '../../../database/schema';
import { createLogger } from '../../../engine/core-modules/logger/create-logger.util';
import { EveryMacScraperService } from '../drivers/everymac/services/everymac-scraper.service';
import { MacConfigException } from '../exceptions/mac-config.exception';
import { convertMacConfigIdentifierToNewFormat } from '../utils/convert-mac-config-identifier-to-new-format.util';

const logger = createLogger('PopulateMacConfigs');

const SEED_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'database',
  'seeds',
  'mac-configs.json',
);

type SeedEntry = { identifier: string; metadata: string };

type PopulateMacConfigsOptions = {
  scrape?: boolean;
  seed?: boolean;
  dryRun?: boolean;
};

@Command({
  name: 'populate-mac-configs',
  description:
    'Scrape Mac specifications into the seed file (--scrape) or insert the seed file into the database (--seed)',
})
export class PopulateMacConfigsCommand extends CommandRunner {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDB,
    private readonly everyMacScraper: EveryMacScraperService,
  ) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: PopulateMacConfigsOptions,
  ): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    if (options?.scrape) {
      await this.scrape({ dryRun });
      return;
    }

    if (options?.seed) {
      await this.seed({ dryRun });
      return;
    }

    throw new MacConfigException(
      'Missing mode flag. Pass --scrape (update seed data) or --seed (insert into database).',
      'POPULATE_MODE_INVALID',
    );
  }

  private async scrape({ dryRun }: { dryRun: boolean }): Promise<void> {
    if (!process.env.OXYLABS_API_CREDENTIALS) {
      throw new MacConfigException(
        'OXYLABS_API_CREDENTIALS environment variable is required',
        'SCRAPER_CREDENTIALS_MISSING',
      );
    }

    const specifications = await this.everyMacScraper.scrapeAllSpecifications();
    logger.log(
      `Scraping completed. Found ${specifications.length} total specifications`,
    );

    const seedData: SeedEntry[] = specifications.map((spec) => ({
      identifier: convertMacConfigIdentifierToNewFormat({
        identifier: spec.identifier,
        metadata: JSON.stringify(spec),
      }),
      metadata: JSON.stringify(spec),
    }));

    if (dryRun) {
      logger.log(
        `[dry-run] Would write ${seedData.length} specifications to ${SEED_PATH}`,
      );
      return;
    }

    writeFileSync(SEED_PATH, JSON.stringify(seedData, null, 2) + '\n');
    logger.log(`Seed data written to ${SEED_PATH}`);
  }

  private async seed({ dryRun }: { dryRun: boolean }): Promise<void> {
    const seedData: SeedEntry[] = JSON.parse(readFileSync(SEED_PATH, 'utf-8'));

    if (dryRun) {
      logger.log(
        `[dry-run] Would upsert ${seedData.length} Mac configurations (onConflictDoNothing)`,
      );
      return;
    }

    for (const entry of seedData) {
      await this.db
        .insert(macConfigs)
        .values({
          identifier: entry.identifier,
          metadata: entry.metadata,
        })
        .onConflictDoNothing({
          target: macConfigs.identifier,
        });
    }

    logger.log(`Seeded ${seedData.length} Mac configurations`);
  }

  @Option({
    flags: '--scrape',
    description: 'Scrape specifications and update the seed file',
  })
  parseScrape(): boolean {
    return true;
  }

  @Option({
    flags: '--seed',
    description: 'Insert the seed file into the database',
  })
  parseSeed(): boolean {
    return true;
  }

  @Option({
    flags: '--dry-run',
    description: 'Log what would change without writing',
  })
  parseDryRun(): boolean {
    return true;
  }
}
