import { createPrismaClient } from '@macgamingdb/server/database';
import { EveryMacScraper } from '@macgamingdb/server/scraper/EveryMacScraper';
import { WebScraper } from '@macgamingdb/server/scraper/WebScraper';
import { createLogger } from '@macgamingdb/server/utils/logger';
import { config } from 'dotenv';
import { convertMacConfigIdentifierToNewFormat } from './migration-utils/convert-mac-config-identifier-new-format';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const prisma = createPrismaClient();
const logger = createLogger('PopulateMacConfigs');

async function populateMacConfigs() {
  const apiCredentials = process.env.OXYLABS_SCRAPER;

  if (!apiCredentials) {
    throw new Error('OXYLABS_SCRAPER environment variable is required');
  }

  const webScraper = new WebScraper(apiCredentials);
  const scraper = new EveryMacScraper(webScraper);

  const specifications = await scraper.scrapeAllSpecifications();

  logger.log(`Scraping completed. Found ${specifications.length} total specifications`);

  await prisma.$transaction(
    async (tx) => {
      for (const spec of specifications) {
        const identifier = convertMacConfigIdentifierToNewFormat({
          identifier: spec.identifier,
          metadata: JSON.stringify(spec),
        });
        await tx.macConfig.upsert({
          where: {
            identifier,
          },
          update: {},
          create: {
            identifier,
            metadata: JSON.stringify(spec),
          },
        });
      }
    },
    { timeout: 36000000 },
  );
}

async function main() {
  try {
    await populateMacConfigs();
  } catch (error) {
    logger.error('Script failed', error instanceof Error ? error.stack : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
