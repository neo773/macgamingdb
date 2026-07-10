export const escapeIgdbQueryValue = (value: string): string =>
  value.replace(/"/g, '\\"');
