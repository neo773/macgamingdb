import { SITE_URL } from '@/modules/layout/constants/SITE_URL';

export const generateMacGamesHubJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Mac Compatible Games',
  description:
    'A community-reported compatibility list for Apple Silicon Macs, with FPS reports for Native, CrossOver and Parallels.',
  url: `${SITE_URL}/mac-games`,
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
    ],
  },
});
