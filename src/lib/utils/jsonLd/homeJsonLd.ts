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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I run Windows games on Mac?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. Many Windows games run on macOS using compatibility layers such as Rosetta 2, CrossOver, Parallels, or Apple's Game Porting Toolkit. MacGamingDB tracks performance for each method.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do M1, M2, M3 and M4 Macs run games better?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Apple Silicon Macs (M1–M4) deliver strong performance in many games. Compatibility varies, so MacGamingDB provides FPS benchmarks and user reports by chip generation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where can I find a list of Mac compatible games?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MacGamingDB is a searchable, community-driven database of Mac compatible games. It includes benchmarks, compatibility methods, and user reviews.',
      },
    },
  ],
};
