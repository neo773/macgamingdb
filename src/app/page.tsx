import { Suspense } from 'react';
import { Footer } from '@/modules/layout/components/Footer';
import { Header } from '@/modules/layout/components/Header';
import { HomeClient } from './home-client';
import { createServerHelpers } from '@/modules/trpc/utils/createServerHelpers';
import { createFilterConfig } from '@/modules/search/utils/createFilterConfig';
import { Container } from 'macgamingdb-ui/layout/Container';
import { type Metadata } from 'next';
import { SITE_URL } from '@/modules/layout/constants/SITE_URL';
import { SearchURLParamsKeys } from '@/modules/search/constants/SearchURLParamsKeys';

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> => {
  const params = await searchParams;
  const isSearchResultPage = Object.hasOwn(params, SearchURLParamsKeys.QUERY);

  return {
    alternates: { canonical: SITE_URL },
    ...(isSearchResultPage && { robots: { index: false, follow: true } }),
  };
};

const Home = async () => {
  const defaultFilterConfig = createFilterConfig({});
  const helpers = await createServerHelpers();

  const GamesPage = await helpers.game.getGames.fetch(defaultFilterConfig);
  const ratingCounts =
    await helpers.game.getFilterCounts.fetch(defaultFilterConfig);

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <div className="relative mx-auto max-w-4xl px-4 pt-8 pb-4 md:px-6 md:pt-12">
        <div className="text-center">
          <h1 className="text-xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-b from-white via-gray-100 to-gray-400 bg-clip-text text-transparent mb-4 md:mb-6 leading-tight">
            The Modern Mac Gaming Compatibility Database
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto px-2">
            Discover which games run on macOS and Apple Silicon
            <br className="hidden md:block" />
            with real-world benchmarks, FPS reports, and support for
            <br className="hidden md:block" />
            CrossOver, Parallels, and GPTK
          </p>
        </div>

        {/* Decorative gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/3 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/4 rounded-full blur-3xl"></div>
        </div>
      </div>

      <Container>
        <Suspense>
          <HomeClient GamesPage={{ ...GamesPage, ratingCounts }} />
        </Suspense>
      </Container>

      <Footer />
    </div>
  );
};

export default Home;
