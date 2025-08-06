import { createPrismaClient } from "@/lib/database/prisma";
import { EveryMacScraper } from "@/lib/scraper/EveryMacScraper";
import { WebScraper } from "@/lib/scraper/WebScraper";
import specifications from "../specifications.json";
import { config } from "dotenv";


if (process.env.NODE_ENV === "production") {
  config({
    path: "../.env.prod",
  });
}

const prisma = createPrismaClient();

function generateConfigId(mac: {
  identifier: string;
  chip: string;
  chipVariant: string;
  cpuCores: number;
  gpuCores: number;
  ram: number;
  year: number;
}): string {
  // Mac16,11*-M4-PRO-12-16-24-2024
  return [
    mac.identifier,
    mac.chip,
    mac.chipVariant,
    mac.cpuCores,
    mac.gpuCores,
    mac.ram,
    mac.year
  ].join('-');
}

async function populateMacConfigs() {
  const apiCredentials = process.env.OXYLABS_SCRAPER;

  if (!apiCredentials) {
    throw new Error("OXYLABS_SCRAPER environment variable is required");
  }

  const webScraper = new WebScraper(apiCredentials);
  const scraper = new EveryMacScraper(webScraper);

  // const specifications = await scraper.scrapeAllSpecifications();

  console.log(`🎉 Scraping completed! Found ${specifications.length} total specifications`);

  for (const spec of specifications) {
    const identifier = generateConfigId(spec);
    await prisma.macConfig.upsert({
      where: {
        identifier,
      },
      update: {
        metadata: JSON.stringify(spec),
      },
      create: {
        identifier,
        metadata: JSON.stringify(spec),
      },
    });
  }
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
