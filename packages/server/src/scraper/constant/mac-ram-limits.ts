import { type Chipset, ChipsetVariant, type MacFamily } from '../../schema';

type RAMLimitsStructure = Record<
  MacFamily,
  Partial<Record<Chipset, Partial<Record<ChipsetVariant, number>>>>
>;

export const RAM_LIMITS: RAMLimitsStructure = {
  MacBookAir: {
    M1: {
      [ChipsetVariant.BASE]: 16,
    },
    M2: {
      [ChipsetVariant.BASE]: 24,
    },
    M3: {
      [ChipsetVariant.BASE]: 24,
    },
    M4: {
      [ChipsetVariant.BASE]: 32,
    },
    M5: {
      [ChipsetVariant.BASE]: 32,
    },
  },
  MacBookNeo: {
    M5: {
      [ChipsetVariant.BASE]: 16,
    },
    A18: {
      [ChipsetVariant.PRO]: 16,
    },
  },
  MacBookPro: {
    M1: {
      [ChipsetVariant.BASE]: 64,
    },
    M2: {
      [ChipsetVariant.BASE]: 24,
      [ChipsetVariant.PRO]: 32,
      [ChipsetVariant.MAX]: 96,
    },
    M3: {
      [ChipsetVariant.BASE]: 24,
      [ChipsetVariant.PRO]: 36,
      [ChipsetVariant.MAX]: 128,
    },
    M4: {
      [ChipsetVariant.BASE]: 32,
      [ChipsetVariant.PRO]: 64,
      [ChipsetVariant.MAX]: 128,
    },
    M5: {
      [ChipsetVariant.BASE]: 32,
      [ChipsetVariant.PRO]: 64,
      [ChipsetVariant.MAX]: 128,
    },
  },
  iMac: {
    M1: {
      [ChipsetVariant.BASE]: 16,
    },
    M3: {
      [ChipsetVariant.BASE]: 24,
    },
    M4: {
      [ChipsetVariant.BASE]: 32,
    },
  },
  MacMini: {
    M1: {
      [ChipsetVariant.BASE]: 16,
    },
    M2: {
      [ChipsetVariant.BASE]: 24,
      [ChipsetVariant.PRO]: 32,
    },
    M3: {
      [ChipsetVariant.BASE]: 24,
    },
    M4: {
      [ChipsetVariant.BASE]: 64,
      [ChipsetVariant.PRO]: 64,
    },
    M5: {
      [ChipsetVariant.BASE]: 64,
      [ChipsetVariant.PRO]: 128,
    },
  },
  MacStudio: {
    M1: {
      [ChipsetVariant.MAX]: 64,
      [ChipsetVariant.ULTRA]: 128,
    },
    M2: {
      [ChipsetVariant.MAX]: 96,
      [ChipsetVariant.ULTRA]: 192,
    },
    M3: {
      [ChipsetVariant.MAX]: 128,
      [ChipsetVariant.ULTRA]: 512,
    },
    M4: {
      [ChipsetVariant.MAX]: 128,
      [ChipsetVariant.ULTRA]: 512,
    },
  },
  MacPro: {
    M2: {
      [ChipsetVariant.ULTRA]: 192,
    },
    M3: {
      [ChipsetVariant.ULTRA]: 512,
    },
    M4: {
      [ChipsetVariant.ULTRA]: 512,
    },
  },
} as const;
