import Link from 'next/link';
import { type Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createServerHelpers } from '@/modules/trpc/utils/createServerHelpers';
import { Header } from '@/modules/layout/components/Header';
import { Footer } from '@/modules/layout/components/Footer';
import { Container } from 'macgamingdb-ui/layout/Container';
import { generateGameJsonLd } from '@/modules/game/utils/generateGameJsonLd';
import { GameDetailHeader } from '@/modules/game/components/GameDetailHeader';
import { GameInfoCard } from '@/modules/game/components/GameInfoCard';
import { GameStatsCard } from '@/modules/game/components/GameStatsCard';
import { CriticScoreBadge } from '@/modules/game/components/CriticScoreBadge';
import { GameMetaBadges } from '@/modules/game/components/GameMetaBadges';
import { MacVerdictSummary } from '@/modules/game/components/MacVerdictSummary';
import { buildMacVerdict } from '@/modules/game/utils/buildMacVerdict';
import { buildGamePageTitle } from '@/modules/game/utils/buildGamePageTitle';
import { SITE_URL } from '@/modules/layout/constants/SITE_URL';
import { ExperienceReportsSection } from '@/modules/game/components/ExperienceReportsSection';
import { GamePageError } from '@/modules/game/components/GamePageError';
import { PriceDisplay } from '@/modules/game/components/PriceDisplay';
import { isNonEmptyArray } from '@sniptt/guards';

export const revalidate = 31536000; // 1 year, revalidated on-demand via mutations

export const generateStaticParams = async () => {
  return [];
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;

  try {
    const helpers = await createServerHelpers();
    const { game } = await helpers.game.getById.fetch({ id });
    const canonicalId = game.slug ?? id;

    return {
      title: buildGamePageTitle(game.name),
      description: `Does ${game.name} run on Mac? Apple Silicon compatibility, FPS reports and settings for Native, CrossOver and Parallels.`,
      alternates: {
        canonical: `${SITE_URL}/games/${canonicalId}`,
      },
      openGraph: {
        title: buildGamePageTitle(game.name),
        description: `How ${game.name} runs on Apple Silicon: community FPS reports for Native, CrossOver and Parallels.`,
        type: 'website',
      },
    };
  } catch {
    return {
      title: 'Game Details - Mac Gaming DB',
      description: 'Details about game performance on Mac',
    };
  }
};

const GamePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const helpers = await createServerHelpers();

  let data;
  try {
    data = await helpers.game.getById.fetch({ id });
  } catch (error) {
    console.error('Error in server component:', error);
    return <GamePageError />;
  }

  const { game, reviews, stats } = data;

  if (game.slug && id !== game.slug) {
    permanentRedirect(`/games/${game.slug}`);
  }

  const identifier = game.slug ?? game.id;
  const hasReviews = isNonEmptyArray(reviews);
  const jsonLd = generateGameJsonLd(identifier, game, stats);

  return (
    <div className="min-h-dvh flex flex-col bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <Container>
        <div className="mb-4">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center"
          >
            <ChevronLeft className="text-blue-400" />
            Home
          </Link>
        </div>

        <GameDetailHeader game={game} />

        <div className="mb-8 flex flex-col gap-4">
          <MacVerdictSummary
            gameName={game.name}
            verdict={buildMacVerdict(reviews)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <GameMetaBadges
              releaseYear={game.releaseYear}
              genres={game.genres}
            />
            <CriticScoreBadge
              criticRating={game.criticRating}
              criticRatingCount={game.criticRatingCount}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GameStatsCard stats={stats} />
          <GameInfoCard description={game.descriptionHtml ?? ''} />
        </div>

        <PriceDisplay gameId={identifier} />

        <ExperienceReportsSection
          gameId={identifier}
          gameName={game.name}
          reviews={reviews}
          showCrossoverAffiliate={hasReviews}
        />
      </Container>
      <Footer />
    </div>
  );
};

export default GamePage;
