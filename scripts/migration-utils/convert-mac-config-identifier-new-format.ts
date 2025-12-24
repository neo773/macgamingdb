import { type MacSpecification } from '@macgamingdb/server/scraper/EveryMacScraper';

export type OldMacConfig = {
  identifier: string;
  metadata: string;
};

export type MacConfigIdentifier =
  `${string}-${string}-${string}-${number}-${number}-${number}-${number}`;

export const convertMacConfigIdentifierToNewFormat = (
  oldConfig: OldMacConfig,
): MacConfigIdentifier => {
  const metadata = JSON.parse(oldConfig.metadata) as MacSpecification;

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
