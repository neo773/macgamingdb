import { createPrismaClient } from '@macgamingdb/server/database';
import { createLogger } from '@macgamingdb/server/utils/logger';
import { config } from 'dotenv';
import { convertMacConfigIdentifierToNewFormat } from './migration-utils/convert-mac-config-identifier-new-format';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const prisma = createPrismaClient();
const logger = createLogger('MigrateToNewMacConfigIdentifier');

async function migrateToNewMacConfigIdentifier() {
  logger.log('Starting Mac config identifier migration');

  const macConfigs = await prisma.macConfig.findMany({
    where: {},
    take: 10000000,
  });

  logger.log(`Found ${macConfigs.length} Mac configs to process`);

  let processed = 0;
  let skipped = 0;

  await prisma.$transaction(
    async (tx) => {
      for (const macConfig of macConfigs) {
        try {
          if (macConfig.identifier.includes('(Rack)')) {
            skipped++;
            continue;
          }
          const newIdentifier = convertMacConfigIdentifierToNewFormat(macConfig);

          await tx.macConfig.update({
            where: { id: macConfig.id },
            data: { identifier: newIdentifier },
          });

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
    },
    { timeout: 3600000 },
  );

  logger.log(`Migration complete: ${processed} processed, ${skipped} skipped`);
}

async function main() {
  try {
    await migrateToNewMacConfigIdentifier();
  } catch (error) {
    logger.error('Script failed', error instanceof Error ? error.stack : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
