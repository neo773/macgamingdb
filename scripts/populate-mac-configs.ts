import { createPrismaClient } from "@/lib/database/prisma";
import { EveryMacScraper } from "@/lib/scraper/EveryMacScraper";
import { WebScraper } from "@/lib/scraper/WebScraper";
import { config } from "dotenv";
import { convertMacConfigIdentifierToNewFormat } from "./migration-utils/convert-mac-config-identifier-new-format";


if (process.env.NODE_ENV === "production") {
  config({
    path: "../.env.prod",
  });
}

const prisma = createPrismaClient();

async function populateMacConfigs() {
  const apiCredentials = process.env.OXYLABS_SCRAPER;

  if (!apiCredentials) {
    throw new Error("OXYLABS_SCRAPER environment variable is required");
  }

  const webScraper = new WebScraper(apiCredentials);
  const scraper = new EveryMacScraper(webScraper);

  const specifications = await scraper.scrapeAllSpecifications();

  console.log(`🎉 Scraping completed! Found ${specifications.length} total specifications`);

  await prisma.$transaction(async (tx) => {
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
  }, { timeout: 36000000 });
}

async function main() {
  try {
    await populateMacConfigs();
  } catch (error) {
    console.error("💥 Script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
