import { createDrizzleClient } from '@macgamingdb/server/database';
import { EveryMacScraper } from '@macgamingdb/server/scraper/EveryMacScraper';
import { WebScraper } from '@macgamingdb/server/scraper/WebScraper';
import { createLogger } from '@macgamingdb/server/utils/logger';
import { convertMacConfigIdentifierToNewFormat } from './migration-utils/convert-mac-config-identifier-new-format';
import { macConfigs } from '@macgamingdb/server/drizzle/schema';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const logger = createLogger('PopulateMacConfigs');
const SEED_PATH = path.join(__dirname, '..', 'packages', 'server', 'src', 'seed', 'mac-configs.json');

type SeedEntry = { identifier: string; metadata: string };

async function scrape() {
  const apiCredentials = process.env.OXYLABS_SCRAPER;

  if (!apiCredentials) {
    throw new Error('OXYLABS_SCRAPER environment variable is required');
  }

  const webScraper = new WebScraper(apiCredentials);
  const scraper = new EveryMacScraper(webScraper);

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
