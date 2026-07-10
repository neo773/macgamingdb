export const extractKeyFromUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.substring(1);
  } catch {
    return null;
  }
};
