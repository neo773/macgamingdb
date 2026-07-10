import type { MetadataRoute } from 'next';
import { createServerHelpers } from '@/lib/trpc/server';

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const helpers = await createServerHelpers();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const entries = await helpers.game.getSitemapEntries.fetch();

  return entries.map((entry) => ({
    url: `${baseUrl}/games/${entry.slug ?? entry.id}`,
    lastModified: new Date(entry.lastModified),
  }));
}
