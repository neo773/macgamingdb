import Link from 'next/link';
import Script from 'next/script';
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
import { ExperienceReportsSection } from '@/modules/game/components/ExperienceReportsSection';
import { GamePageError } from '@/modules/game/components/GamePageError';
import { PriceDisplay } from '@/modules/game/components/PriceDisplay';

export const revalidate = 31536000; // 1 year, revalidated on-demand via mutations

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const helpers = await createServerHelpers();
    const { game } = await helpers.game.getById.fetch({ id });
    const canonicalId = game.slug ?? id;

    return {
      title: `${game.name} – Mac Compatibility & Apple Silicon Performance | MacGamingDB`,
      description: `Can you play ${game.name} on Mac? Check Apple Silicon (M1–M4) compatibility, FPS benchmarks, and user reports for Native, Rosetta 2, CrossOver, Parallels & Game Porting Toolkit.`,
      alternates: {
        canonical: `https://macgamingdb.app/games/${canonicalId}`,
      },
      openGraph: {
        title: `${game.name} – Mac Compatibility & Apple Silicon Performance`,
        description: `Discover how ${game.name} runs on macOS. Includes benchmarks, compatibility layers (Rosetta, CrossOver, Parallels, GPTK), and community reviews.`,
        type: 'website',
      },
    };
  } catch {
    return {
      title: 'Game Details - Mac Gaming DB',
      description: 'Details about game performance on Mac',
    };
  }
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
  const hasReviews = reviews && reviews.length > 0;
  const jsonLd = generateGameJsonLd(identifier, game, stats);

  return (
    <div className="min-h-dvh flex flex-col bg-black">
      <Script
        type="application/ld+json"
        id={`jsonLdGame${game.id}`}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GameInfoCard description={game.descriptionHtml ?? ''} />
          <GameStatsCard stats={stats} />
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
}
