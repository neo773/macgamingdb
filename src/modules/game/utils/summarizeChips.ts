const MAX_LISTED_CHIPS = 4;

export const summarizeChips = (chips: string[]): string => {
  if (chips.length <= MAX_LISTED_CHIPS) {
    return chips.join(', ');
  }

  const generations = [
    ...new Set(chips.map((chip) => chip.split(' ')[0])),
  ].sort();

  if (generations.length === 1) {
    return `${generations[0]} variants`;
  }

  return `${generations[0]} to ${generations[generations.length - 1]}`;
};
