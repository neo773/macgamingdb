import { type MacSpecification } from '../../../types/mac-specification.type';

// TODO: Remove once the scraper config supports MacBook Neo (2nd generation).
export const MACBOOK_NEO_SPECIFICATIONS: MacSpecification[] = [
  {
    family: 'MacBookNeo',
    model: 'MacBook Neo A18 Pro 6 CPU/5 GPU',
    identifier: 'Mac17,5',
    chip: 'A18',
    chipVariant: 'PRO',
    cpuCores: 6,
    gpuCores: 5,
    ram: 8,
    year: 2026,
  },
];
