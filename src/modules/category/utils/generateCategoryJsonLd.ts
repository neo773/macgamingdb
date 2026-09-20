import { SITE_URL } from '@/modules/layout/constants/SITE_URL';
import { type GameCategory } from '@/modules/category/types/GameCategory';
import { type GameCategorySlug } from '@/modules/category/types/GameCategorySlug';

type GenerateCategoryJsonLdParams = {
  slug: GameCategorySlug;
  category: Pick<GameCategory, 'heading' | 'metaDescription'>;
};

export const generateCategoryJsonLd = ({
  slug,
  category,
}: GenerateCategoryJsonLdParams) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: category.heading,
  description: category.metaDescription,
  url: `${SITE_URL}/mac-games/${slug}`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'MacGamingDB',
    url: SITE_URL,
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Mac Games',
        item: `${SITE_URL}/mac-games`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.heading,
        item: `${SITE_URL}/mac-games/${slug}`,
      },
    ],
  },
});
