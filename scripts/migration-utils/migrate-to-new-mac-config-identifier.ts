import { createPrismaClient } from "@/lib/database/prisma";

import { config } from "dotenv";
import { convertMacConfigIdentifierToNewFormat } from "./convert-mac-config-identifier-new-format";

if (process.env.NODE_ENV === "production") {
  config({
    path: "../.env.prod",
  });
}

const prisma = createPrismaClient();

async function migrateToNewMacConfigIdentifier() {
  const macConfigs = await prisma.macConfig.findMany({
    where: {},
    take: 10000000,
  });
  console.log(macConfigs.length, "macConfigs");

  await prisma.$transaction(async (tx) => {
    for (const macConfig of macConfigs) {
      try {
        if (macConfig.identifier.includes("(Rack)")) {
          continue;
        }
        const newIdentifier = convertMacConfigIdentifierToNewFormat(macConfig);

        await tx.macConfig.update({
          where: { id: macConfig.id },
          data: { identifier: newIdentifier },
        });
      } catch (error) {
        console.log(macConfig, "macConfig");

        const newIdentifier = convertMacConfigIdentifierToNewFormat(macConfig);

        console.error(
          `Error updating macConfig with id ${macConfig.id}: newIdentifier: ${newIdentifier}`,
          error
        );
      }
    }
  });
}

async function main() {
  try {
    await migrateToNewMacConfigIdentifier();
  } catch (error) {
    console.error("💥 Script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
