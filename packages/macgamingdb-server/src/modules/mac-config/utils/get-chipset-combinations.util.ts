import { type Chipset } from '../../../schema';
import { CHIPSET_VARIANTS, CHIPSETS } from '../../../schema/constants';

export type ChipsetCombination = {
  value: string;
  label: string;
};

export type ChipsetGroup = {
  chipset: Chipset;
  variants: ChipsetCombination[];
};

const formatLabel = (chipset: Chipset, variant: string): string =>
  variant === 'BASE' ? chipset : `${chipset} ${variant}`;

export const getChipsetCombinations = (): ChipsetCombination[] => {
  const combinations: ChipsetCombination[] = [];
  for (const chipset of CHIPSETS) {
    for (const variant of CHIPSET_VARIANTS[chipset]) {
      combinations.push({
        value: `${chipset}-${variant}`,
        label: formatLabel(chipset, variant),
      });
    }
  }
  return combinations;
};

export const getGroupedChipsetCombinations = (): ChipsetGroup[] =>
  CHIPSETS.map((chipset) => ({
    chipset,
    variants: CHIPSET_VARIANTS[chipset].map((variant) => ({
      value: `${chipset}-${variant}`,
      label: formatLabel(chipset, variant),
    })),
  }));
