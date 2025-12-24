import { ChipsetEnum, ChipsetVariantEnum } from '../schema';

export type ChipsetCombination = {
  value: string;
  label: string;
};

export const getChipsetCombinations = (): ChipsetCombination[] => {
  const combinations: ChipsetCombination[] = [];
  for (const chipset of ChipsetEnum.options) {
    for (const variant of ChipsetVariantEnum.options) {
      combinations.push({
        value: `${chipset}-${variant}`,
        label: variant === 'BASE' ? chipset : `${chipset} ${variant}`,
      });
    }
  }
  return combinations;
};
