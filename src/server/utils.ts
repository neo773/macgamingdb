import { ChipsetEnum, ChipsetVariantEnum } from "./schema";

export const getChipsetCombinations = () => {
  const combinations = [];
  for (const chipset of ChipsetEnum.options) {
    for (const variant of ChipsetVariantEnum.options) {
      combinations.push({
        value: `${chipset}-${variant}`,
        label: variant === "BASE" ? chipset : `${chipset} ${variant}`,
      });
    }
  }
  return combinations;
};

export const formatRatingLabel = (rating: string) => {
  switch (rating) {
    case "ALL":
      return "All Games";
    case "EXCELLENT":
      return "Excellent";
    case "GOOD":
      return "Good";
    case "BARELY_PLAYABLE":
      return "Barely Playable";
    case "PLAYABLE":
      return "Playable";
    case "UNPLAYABLE":
      return "Unplayable";
    default:
      return rating;
  }
};
