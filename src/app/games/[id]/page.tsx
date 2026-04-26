import Link from 'next/link';
import Script from 'next/script';
import { type Metadata } from 'next';
import { headers } from 'next/headers';
import { ChevronLeft } from 'lucide-react';
import { createServerHelpers } from '@/lib/trpc/server';
import Header from '@/modules/layout/components/Header';
import Footer from '@/modules/layout/components/Footer';
import { Container } from '@/components/ui/container';
import { generateGameJsonLd } from '@/lib/utils/jsonLd';
import { getRegion } from '@/lib/utils/getRegion';
import { parseGameDetails } from '@/modules/game/utils';
import {
  GameDetailHeader,
  GameInfoCard,
  GameStatsCard,
  ExperienceReportsSection,
  GamePageError,
} from '@/modules/game/components';
import { PriceDisplay } from '@/modules/game/components/PriceDisplay';
import { getGamePrices } from '@macgamingdb/server/api/ggdeals';

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
    const gameDetails = parseGameDetails(game?.details ?? null);
    const gameName = gameDetails.name || 'This Game';

    return {
      title: `${gameName} – Mac Compatibility & Apple Silicon Performance | MacGamingDB`,
      description: `Can you play ${gameName} on Mac? Check Apple Silicon (M1–M4) compatibility, FPS benchmarks, and user reports for Native, Rosetta 2, CrossOver, Parallels & Game Porting Toolkit.`,
      openGraph: {
        title: `${gameName} – Mac Compatibility & Apple Silicon Performance`,
        description: `Discover how ${gameName} runs on macOS. Includes benchmarks, compatibility layers (Rosetta, CrossOver, Parallels, GPTK), and community reviews.`,
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
  const headerStore = await headers();
  const region = getRegion(headerStore);
  const helpers = await createServerHelpers();

  try {
    const [{ game, reviews, stats }, priceData] = await Promise.all([
      helpers.game.getById.fetch({ id }),
      getGamePrices(id, region)
        .then((res) => res ?? null)
        .catch(() => null),
    ]);
    const gameDetails = parseGameDetails(game?.details ?? null);
    const hasReviews = reviews && reviews.length > 0;
    const jsonLd = generateGameJsonLd(id, gameDetails, stats);

    return (
      <div className="min-h-dvh flex flex-col bg-black">
        <Script
          type="application/ld+json"
          id={`jsonLdGame${id}`}
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

          <GameDetailHeader gameDetails={gameDetails} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GameInfoCard description={gameDetails.detailed_description} />
            <GameStatsCard stats={stats} />
          </div>

          {priceData && <PriceDisplay priceData={priceData} />}

          <ExperienceReportsSection
            gameId={id}
            gameName={gameDetails.name}
            reviews={reviews}
            showCrossoverAffiliate={hasReviews}
          />
        </Container>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error in server component:', error);
    return <GamePageError />;
  }
}
