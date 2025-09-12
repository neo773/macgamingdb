import { createPrismaClient } from '@/lib/database/prisma';

import { config } from 'dotenv';
import { convertMacConfigIdentifierToNewFormat } from './migration-utils/convert-mac-config-identifier-new-format';

if (process.env.NODE_ENV === 'production') {
  config({
    path: '../.env.prod',
  });
}

const prisma = createPrismaClient();

async function migrateToNewMacConfigIdentifier() {
  const macConfigs = await prisma.macConfig.findMany({
    where: {},
    take: 10000000,
  });

  await prisma.$transaction(
    async (tx) => {
      for (const macConfig of macConfigs) {
        try {
          if (macConfig.identifier.includes('(Rack)')) {
            continue;
          }
          const newIdentifier =
            convertMacConfigIdentifierToNewFormat(macConfig);

          await tx.macConfig.update({
            where: { id: macConfig.id },
            data: { identifier: newIdentifier },
          });
        } catch (error) {
          console.log(macConfig, 'macConfig');

          const newIdentifier =
            convertMacConfigIdentifierToNewFormat(macConfig);

          console.error(
            `Error updating macConfig with id ${macConfig.id}: newIdentifier: ${newIdentifier}`,
            error,
          );
        }
      }
    },
    { timeout: 3600000 },
  );
}

async function main() {
  try {
    await migrateToNewMacConfigIdentifier();
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
