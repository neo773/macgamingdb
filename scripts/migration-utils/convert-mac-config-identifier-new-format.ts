import { type MacSpecification } from '@/lib/scraper/EveryMacScraper';

export type OldMacConfig = {
  identifier: string;
  metadata: string;
};
// Identifier, Chip, Chip Variant, CPU Cores, GPU Cores, RAM, Year
export type MacConfigIdentifier =
  `${string}-${string}-${string}-${number}-${number}-${number}-${number}`;

export const convertMacConfigIdentifierToNewFormat = (
  oldConfig: OldMacConfig,
): MacConfigIdentifier => {
  const metadata = JSON.parse(oldConfig.metadata) as MacSpecification;

  // Ensure all number fields are numbers, and build the string in a type-safe way
  const identifier = String(metadata.identifier);
  const chip = String(metadata.chip);
  const chipVariant = String(metadata.chipVariant);
  const cpuCores = Number(metadata.cpuCores);
  const gpuCores = Number(metadata.gpuCores);
  const ram = Number(metadata.ram);
  const year = Number(metadata.year);

  const result =
    `${identifier}-${chip}-${chipVariant}-${cpuCores}-${gpuCores}-${ram}-${year}` as const;

  return result;
};
