import { ChipsetEnum, ChipsetVariantEnum } from '@/server/schema';

export const getChipsetCombinations = () => {
  const combinations = [];
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
