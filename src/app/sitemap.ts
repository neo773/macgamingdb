import type { MetadataRoute } from 'next';
import { createServerHelpers } from '@/modules/trpc/utils/createServerHelpers';

export const revalidate = 3600; // 1 hour

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const helpers = await createServerHelpers();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const entries = await helpers.game.getSitemapEntries.fetch();

  return entries.map((entry) => ({
    url: `${baseUrl}/games/${entry.slug ?? entry.id}`,
    lastModified: new Date(entry.lastModified),
  }));
};

export default sitemap;

export const dynamic = "force-dynamic";
