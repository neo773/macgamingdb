/**
 * Gets base URL for API endpoints
 */
export function getUrl() {
  if (typeof window !== 'undefined') {
    return '/api/trpc';
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://macgamingdb.local');
  return `${baseUrl}/api/trpc`;
}
