export const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MacGamingDB',
  url: 'https://macgamingdb.app',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://macgamingdb.app/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};
