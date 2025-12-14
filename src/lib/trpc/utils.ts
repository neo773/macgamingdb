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
      : 'http://localhost:3000');
  return `${baseUrl}/api/trpc`;
}
