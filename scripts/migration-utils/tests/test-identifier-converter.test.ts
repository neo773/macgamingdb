import { describe, it, expect } from 'bun:test';
import { convertMacConfigIdentifierToNewFormat } from '../convert-mac-config-identifier-new-format';

interface OldMacConfig {
  id: string;
  identifier: string;
  metadata: string;
}

const mockOldMacConfigs: OldMacConfig[] = [
  {
    id: 'cmdqikxog000074gqh9izenfu',
    identifier: 'MacBookPro17,1-M1-BASE-8-8-8-2020',
    metadata:
      '{"family":"MacBookPro","model":"MacBook Pro M1 8 CPU/8 GPU 13","identifier":"MacBookPro17,1","chip":"M1","chipVariant":"BASE","cpuCores":8,"gpuCores":8,"year":2020,"ram":8}',
  },
  {
    id: 'cmdqikxoj000174gqrszvmc3k',
    identifier: 'MacBookPro17,1-M1-BASE-8-8-16-2020',
    metadata:
      '{"family":"MacBookPro","model":"MacBook Pro M1 8 CPU/8 GPU 13","identifier":"MacBookPro17,1","chip":"M1","chipVariant":"BASE","cpuCores":8,"gpuCores":8,"year":2020,"ram":16}',
  },
  {
    id: 'cmdqikxpj001d74gqj5rtv0ub',
    identifier: 'Mac15,8-M3-MAX-16-40-64-2023',
    metadata:
      '{"family":"MacBookPro","model":"MacBook Pro M3 Max 16 CPU/40 GPU 14","identifier":"Mac15,8","chip":"M3","chipVariant":"MAX","cpuCores":16,"gpuCores":40,"year":2023,"ram":64}',
  },
];

describe('MacConfigIdentifierConverter', () => {
  it('should convert old identifier to new identifier for M1 8GB RAM', () => {
    const newIdentifier = convertMacConfigIdentifierToNewFormat(
      mockOldMacConfigs[0],
    );
    expect(newIdentifier).toBe('MacBookPro17,1-M1-BASE-8-8-8-2020');
  });

  it('should convert old identifier to new identifier for M1 16GB RAM', () => {
    const newIdentifier = convertMacConfigIdentifierToNewFormat(
      mockOldMacConfigs[1],
    );
    expect(newIdentifier).toBe('MacBookPro17,1-M1-BASE-8-8-16-2020');
  });

  it('should convert old identifier to new identifier for M3 Max 64GB RAM', () => {
    const newIdentifier = convertMacConfigIdentifierToNewFormat(
      mockOldMacConfigs[2],
    );
    expect(newIdentifier).toBe('Mac15,8-M3-MAX-16-40-64-2023');
  });
});
