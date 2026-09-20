import { type Metadata } from 'next';
import { Container } from 'macgamingdb-ui/layout/Container';
import { Header } from '@/modules/layout/components/Header';
import { Footer } from '@/modules/layout/components/Footer';
import { SITE_URL } from '@/modules/layout/constants/SITE_URL';
import { createServerHelpers } from '@/modules/trpc/utils/createServerHelpers';
import { buildCategoryGamesInput } from '@/modules/category/utils/buildCategoryGamesInput';
import { generateMacGamesHubJsonLd } from '@/modules/category/utils/generateMacGamesHubJsonLd';
import { CategoryGameGrid } from '@/modules/category/components/CategoryGameGrid';
import { CategoryLinks } from '@/modules/category/components/CategoryLinks';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Mac Compatible Games List – Apple Silicon',
  description:
    'Which games run on a Mac? Browse the compatibility list for Apple Silicon, with community FPS reports for Native, CrossOver and Parallels.',
  alternates: {
    canonical: `${SITE_URL}/mac-games`,
  },
  openGraph: {
    title: 'Mac Compatible Games List – Apple Silicon',
    description:
      'Browse the Mac game compatibility list for Apple Silicon, with community FPS reports for Native, CrossOver and Parallels.',
    type: 'website',
  },
};

const MacGamesPage = async () => {
  const helpers = await createServerHelpers();
  const initialGamesPage = await helpers.game.getGames.fetch(
    buildCategoryGamesInput({}),
  );

  return (
    <div className="min-h-dvh flex flex-col bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateMacGamesHubJsonLd()),
        }}
      />
      <Header />
      <Container>
        <div className="mb-8 max-w-3xl">
          <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">
            Mac Compatible Games
          </h1>
          <p className="mb-4 text-lg text-gray-400">
            A community-reported compatibility list for Apple Silicon Macs
          </p>
          <p className="leading-relaxed text-gray-300">
            Every entry here is backed by reports from people who actually ran
            the game on their own Mac, recording the chip, the play method and
            the framerate they measured. Browse by chip if you want to know what
            your specific machine can handle, or by play method if you already
            know whether you are running natively, through CrossOver or inside
            Parallels.
          </p>
        </div>

        <CategoryLinks title="Browse by chip or play method" />

        <div className="mt-12">
          <h2 className="mb-6 text-xl font-semibold text-gray-200">
            All games
          </h2>
          <CategoryGameGrid
            category={{}}
            initialGamesPage={initialGamesPage}
          />
        </div>
      </Container>
      <Footer />
    </div>
  );
};

export default MacGamesPage;
