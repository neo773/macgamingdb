import type { MetadataRoute } from 'next';
import { createServerHelpers } from '@/modules/trpc/utils/createServerHelpers';
import { SITE_URL } from '@/modules/layout/constants/SITE_URL';
import { GAME_CATEGORIES } from '@/modules/category/constants/GAME_CATEGORIES';

export const revalidate = 3600;

const STATIC_PATHS = ['', '/mac-games', '/blog', '/contributors'];

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const helpers = await createServerHelpers();
  const entries = await helpers.game.getSitemapEntries.fetch();
  const lastModified = new Date();

  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
  }));

  const categoryEntries = Object.keys(GAME_CATEGORIES).map((slug) => ({
    url: `${SITE_URL}/mac-games/${slug}`,
    lastModified,
  }));

  const gameEntries = entries.map((entry) => ({
    url: `${SITE_URL}/games/${entry.slug ?? entry.id}`,
    lastModified: new Date(entry.lastModified),
  }));

  return [...staticEntries, ...categoryEntries, ...gameEntries];
};

export default sitemap;

export const dynamic = 'force-dynamic';
