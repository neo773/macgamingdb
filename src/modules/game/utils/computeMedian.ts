export const computeMedian = (values: number[]): number | undefined => {
  if (values.length === 0) {
    return undefined;
  }
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
};
