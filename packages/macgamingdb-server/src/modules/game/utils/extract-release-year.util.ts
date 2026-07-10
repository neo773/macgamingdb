export const extractReleaseYear = (
  dateText: string | null | undefined,
): number | undefined => {
  const yearMatch = dateText?.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? Number.parseInt(yearMatch[0], 10) : undefined;
};
