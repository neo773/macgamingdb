import type { Metadata } from 'next';
import { Suspense } from 'react';
import Footer from '@/modules/layout/components/Footer';
import Header from '@/modules/layout/components/Header';
import GameBrowser from '../modules/home/components/GameBrowser';
import { createServerHelpers } from '@/lib/trpc/server';
import { createFilterConfig } from '@/lib/constants';
import { Container } from '@/components/ui/container';
import { HomeHero } from '@/modules/home/components/HomeHero';

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
  title: 'macgamingdb — Mac & Apple Silicon Game Compatibility',
  description:
    'Discover which games run on macOS and Apple Silicon with real-world benchmarks, FPS reports, and support for CrossOver, Parallels, and GPTK.',
};

export default async function Home() {
  const defaultFilterConfig = createFilterConfig();
  const helpers = await createServerHelpers();

  const [GamesPage, ratingCounts] = await Promise.all([
    helpers.game.getGames.fetch(defaultFilterConfig),
    helpers.game.getFilterCounts.fetch(defaultFilterConfig),
  ]);

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <HomeHero />
      <Container>
        <GameBrowser GamesPage={{ ...GamesPage, ratingCounts }} />
      </Container>
      <Footer />
    </div>
  );
}
