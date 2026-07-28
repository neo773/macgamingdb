export const PLAY_METHODS = ['NATIVE', 'CROSSOVER', 'PARALLELS'] as const;

export const TRANSLATION_LAYERS = ['DXVK', 'DXMT', 'D3D_METAL', 'NONE'] as const;

export const PERFORMANCE_RATINGS = [
  'EXCELLENT',
  'VERY_GOOD',
  'GOOD',
  'PLAYABLE',
  'BARELY_PLAYABLE',
  'UNPLAYABLE',
] as const;

export const MAC_FAMILIES = [
  'MacBookAir',
  'MacBookPro',
  'iMac',
  'MacMini',
  'MacStudio',
  'MacPro',
  'MacBookNeo',
] as const;

export const GRAPHICS_SETTINGS = ['ULTRA', 'HIGH', 'MEDIUM', 'LOW'] as const;

export const CHIPSETS = ['A18', 'M1', 'M2', 'M3', 'M4', 'M5'] as const;

export const CHIPSET_VARIANT_NAMES = ['BASE', 'PRO', 'MAX', 'ULTRA'] as const;

export const CHIPSET_VARIANTS: Record<
  (typeof CHIPSETS)[number],
  (typeof CHIPSET_VARIANT_NAMES)[number][]
> = {
  A18: ['PRO'],
  M1: ['BASE', 'PRO', 'MAX', 'ULTRA'],
  M2: ['BASE', 'PRO', 'MAX', 'ULTRA'],
  M3: ['BASE', 'PRO', 'MAX', 'ULTRA'],
  M4: ['BASE', 'PRO', 'MAX'],
  M5: ['BASE', 'PRO', 'MAX'],
};

export const SOFTWARE_VERSIONS = {
  CROSSOVER: ['26.0', '25.1.1', '25.1.0', '25.0.1', '25.0', '24.0'],
  PARALLELS: ['26', '20', '19'],
} as const;

export const isValidChipsetVariant = (
  chipset: (typeof CHIPSETS)[number],
  variant: (typeof CHIPSET_VARIANT_NAMES)[number],
): boolean => CHIPSET_VARIANTS[chipset].includes(variant);
