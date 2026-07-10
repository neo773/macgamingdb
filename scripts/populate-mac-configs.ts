import { createDrizzleClient } from 'macgamingdb-server/database';
import { EveryMacScraperService } from 'macgamingdb-server/modules/mac-config/drivers/everymac/services/everymac-scraper.service';
import { WebScraperService } from 'macgamingdb-server/engine/core-modules/scraper/services/web-scraper.service';
import { createLogger } from 'macgamingdb-server/engine/core-modules/logger/create-logger';
import { convertMacConfigIdentifierToNewFormat } from './migration-utils/convert-mac-config-identifier-new-format';
import { macConfigs } from 'macgamingdb-server/drizzle/schema';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const logger = createLogger('PopulateMacConfigs');
const SEED_PATH = path.join(
  __dirname,
  '..',
  'packages',
  'macgamingdb-server',
  'src',
  'database',
  'seeds',
  'mac-configs.json',
);

type SeedEntry = { identifier: string; metadata: string };

async function scrape() {
  if (!process.env.OXYLABS_API_CREDENTIALS) {
    throw new Error('OXYLABS_API_CREDENTIALS environment variable is required');
  }

  const scraper = new EveryMacScraperService(new WebScraperService());

  const specifications = await scraper.scrapeAllSpecifications();
  logger.log(`Scraping completed. Found ${specifications.length} total specifications`);

  const seedData: SeedEntry[] = specifications.map((spec) => ({
    identifier: convertMacConfigIdentifierToNewFormat({
      identifier: spec.identifier,
      metadata: JSON.stringify(spec),
    }),
    metadata: JSON.stringify(spec),
  }));

  writeFileSync(SEED_PATH, JSON.stringify(seedData, null, 2) + '\n');
  logger.log(`Seed data written to ${SEED_PATH}`);
}

async function seed() {
  const db = createDrizzleClient();
  const seedData: SeedEntry[] = JSON.parse(readFileSync(SEED_PATH, 'utf-8'));

  for (const entry of seedData) {
    await db
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

async function main() {
  const mode = process.argv[2];

  try {
    switch (mode) {
      case '--scrape':
        await scrape();
        break;
      case '--seed':
        await seed();
        break;
      default:
        logger.error(`Usage: --scrape (update seed data) or --seed (insert into database)`);
        process.exit(1);
    }
  } catch (error) {
    logger.error('Script failed', error instanceof Error ? error.stack : String(error));
    process.exit(1);
  }
}

main();
