import { type MacSpecification } from '../../src/modules/mac-config/dtos/mac-specification.dto';

type TestMacConfig = {
  id: string;
  identifier: string;
  metadata: MacSpecification;
};

export const createTestMacConfig = (
  overrides: Partial<TestMacConfig> = {},
): TestMacConfig => ({
  id: 'mac_config_m4_pro',
  identifier: 'MacBookPro18,1',
  ...overrides,
  metadata: {
    family: 'MacBook Pro',
    model: 'MacBook Pro (14-inch, 2024)',
    identifier: 'MacBookPro18,1',
    chip: 'M4',
    chipVariant: 'PRO',
    cpuCores: 12,
    gpuCores: 16,
    ram: 24,
    year: 2024,
    ...overrides.metadata,
  },
});
