import { createDrizzleClient } from '@macgamingdb/server/database';
import { createLogger } from '@macgamingdb/server/utils/logger';
import { config } from 'dotenv';
import { convertMacConfigIdentifierToNewFormat } from './migration-utils/convert-mac-config-identifier-new-format';
import { macConfigs } from '@macgamingdb/server/drizzle/schema';
import { eq } from 'drizzle-orm';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const db = createDrizzleClient();
const logger = createLogger('MigrateToNewMacConfigIdentifier');

async function migrateToNewMacConfigIdentifier() {
  logger.info('Starting Mac config identifier migration');

  const allMacConfigs = await db.select().from(macConfigs);

  logger.info(`Found ${allMacConfigs.length} Mac configs to process`);

  let processed = 0;
  let skipped = 0;

  for (const macConfig of allMacConfigs) {
    try {
      if (macConfig.identifier.includes('(Rack)')) {
        skipped++;
        continue;
      }
      const newIdentifier = convertMacConfigIdentifierToNewFormat(macConfig);

      await db
        .update(macConfigs)
        .set({ identifier: newIdentifier })
        .where(eq(macConfigs.id, macConfig.id));

      processed++;
      if (processed % 100 === 0) {
        logger.info(`Processed ${processed} configs`);
      }
    } catch (error) {
      const newIdentifier = convertMacConfigIdentifierToNewFormat(macConfig);
      logger.error({ err: error, macConfigId: macConfig.id, newIdentifier }, 'Error updating macConfig');
    }
  }

  logger.info(`Migration complete: ${processed} processed, ${skipped} skipped`);
}

async function main() {
  try {
    await migrateToNewMacConfigIdentifier();
  } catch (error) {
    logger.error({ err: error }, 'Script failed');
    process.exit(1);
  }
}

main();
