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
  logger.log('Starting Mac config identifier migration');

  const allMacConfigs = await db.select().from(macConfigs);

  logger.log(`Found ${allMacConfigs.length} Mac configs to process`);

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
        logger.log(`Processed ${processed} configs`);
      }
    } catch (error) {
      const newIdentifier = convertMacConfigIdentifierToNewFormat(macConfig);
      logger.error(
        `Error updating macConfig with id ${macConfig.id}: newIdentifier: ${newIdentifier}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  logger.log(`Migration complete: ${processed} processed, ${skipped} skipped`);
}

async function main() {
  try {
    await migrateToNewMacConfigIdentifier();
  } catch (error) {
    logger.error('Script failed', error instanceof Error ? error.stack : String(error));
    process.exit(1);
  }
}

main();
