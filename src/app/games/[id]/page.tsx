import Link from 'next/link';
import { createServerHelpers } from '@/lib/trpc/server';
import { type Metadata } from 'next';
import CreateReviewDialog from '@/components/review/CreateReviewDialog';
import ExpandableDescription from '@/components/review/ExpandableDescription';
import { Card, CardContent } from '@/components/ui/card';
import * as React from 'react';
import { ChevronLeft } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';
import GameReviewCard from '@/components/review/ReviewCard';
import { type SteamAppData } from '@/server/helpers/steam';
import { Container } from '@/components/ui/container';
import Script from 'next/script';
import { AdSpaceAvailableBanner } from './AdSpaceAvailableBanner';

export const revalidate = 31536000;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const helpers = await createServerHelpers();
    const { game } = await helpers.game.getById.fetch({ id });

    let gameDetails: SteamAppData;
    try {
      gameDetails = JSON.parse(game?.details || '{}') as SteamAppData;
    } catch (parseError) {
      console.error('Failed to parse game details in metadata:', parseError);
      return {
        title: 'Game Details - Mac Gaming DB',
        description: 'Details about game performance on Mac',
      };
    }
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
  } catch (error) {
    console.error('Error generating metadata:', error);
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

  try {
    const { game, reviews, stats } = await helpers.game.getById.fetch({ id });

    let gameDetails: SteamAppData;
    try {
      gameDetails = JSON.parse(game?.details || '{}') as SteamAppData;
    } catch (parseError) {
      console.error('Failed to parse game details:', parseError, game?.details);

      gameDetails = {
        name: 'Game Information Unavailable',
        detailed_description:
          'Game details could not be loaded at this time. Please try again later.',
        header_image: '',
        release_date: { date: 'Unknown', coming_soon: false },
      } as SteamAppData;
    }

    const hasReviews = reviews && reviews.length > 0;

    const showCrossoverAffiliate = hasReviews;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: gameDetails.name || 'Game',
      url: `https://macgamingdb.app/games/${id}`,
      gamePlatform: 'macOS',
      operatingSystem: 'macOS (Apple Silicon M1–M4)',
      applicationCategory: 'Game',
      description: gameDetails.detailed_description
        ? gameDetails.detailed_description.replace(/<[^>]*>?/gm, '')
        : 'Game details unavailable',
      image: gameDetails.header_image || '',
      publisher: gameDetails.publishers ? gameDetails.publishers[0] : '',
      sameAs: [
        gameDetails.website || '',
        gameDetails.steam_appid
          ? `https://store.steampowered.com/app/${gameDetails.steam_appid}`
          : '',
      ].filter(Boolean),
      aggregateRating: stats
        ? {
            '@type': 'AggregateRating',
            ratingValue: stats.averagePerformance?.toFixed(1) || '0',
            ratingCount: stats.totalReviews || 0,
          }
        : undefined,
    };

    return (
      <div className="min-h-screen flex flex-col bg-black">
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

          <div className="relative mb-8">
            <div className="aspect-[3/1] rounded-xl overflow-hidden relative ring-1 ring-gray-800 shadow-lg shadow-blue-900/20">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
              {gameDetails.header_image ? (
                <img
                  src={gameDetails.header_image}
                  alt={`${gameDetails.name} cover art`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <p className="text-gray-400">Game image unavailable</p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {gameDetails.name || 'Game Information Unavailable'}
                </h1>
                {gameDetails.release_date && (
                  <p className="text-gray-300">
                    Publisher: {gameDetails.publishers[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Game info and stats section */}
            <div className="md:col-span-2">
              <h1 className="text-2xl text-white font-semibold ">
                Game Information
              </h1>
              <Card className=" shadow-lg mb-8 mt-4 bg-primary-gradient">
                <CardContent className="text-gray-300">
                  <ExpandableDescription
                    description={
                      gameDetails.detailed_description ||
                      'No description available.'
                    }
                  />
                </CardContent>
              </Card>
            </div>

            {/* Stats section */}
            <div>
              <h1 className="text-2xl text-white font-semibold ">
                Mac Performance Stats
              </h1>
              <Card className=" shadow-lg mb-8 mt-4 bg-primary-gradient">
                <CardContent>
                  {stats ? (
                    <>
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2 text-gray-300">
                          Experience Reports
                        </h3>
                        <p className="text-3xl font-bold text-white">
                          {stats.totalReviews}
                        </p>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2 text-gray-300">
                          Play Methods
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between text-gray-300">
                            <span>Native</span>
                            <span className="font-medium text-white">
                              {stats.methods.native}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-300">
                            <span>CrossOver</span>
                            <span className="font-medium text-white">
                              {stats.methods.crossover}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-300">
                            <span>Parallels</span>
                            <span className="font-medium text-white">
                              {stats.methods.parallels}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-300">
                            <span>Other</span>
                            <span className="font-medium text-white">
                              {stats.methods.other}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2 text-gray-300">
                          Average Rating
                        </h3>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  (stats.averagePerformance / 5) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-white">
                            {stats.averagePerformance.toFixed(1)}/5
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p>No experience reports yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Experience Reports section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                Experience Reports
              </h2>
              {reviews && reviews.length > 0 && (
                <CreateReviewDialog gameId={id} gameName={gameDetails.name} />
              )}
            </div>

            {reviews && reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {showCrossoverAffiliate && <AdSpaceAvailableBanner />}
                {reviews.map((review) => (
                  <GameReviewCard review={review} key={review.id} />
                ))}
              </div>
            ) : (
              <Card className="bg-primary-gradient">
                <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
                  <h1 className="text-xl font-medium">
                    No experience reports yet
                  </h1>
                  <CreateReviewDialog gameId={id} gameName={gameDetails.name} />
                </CardContent>
              </Card>
            )}
          </div>
        </Container>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error in server component:', error);

    return (
      <div className="min-h-screen flex flex-col bg-black">
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

          <Card className="bg-primary-gradient shadow-lg mt-8">
            <CardContent className="p-8">
              <h1 className="text-2xl font-bold text-white mb-4">
                Game Information Temporarily Unavailable
              </h1>
              <p className="text-gray-300 mb-4">
                We're having trouble loading the information for this game. This
                could be due to:
              </p>
              <ul className="list-disc pl-5 text-gray-300 mb-6 space-y-2">
                <li>Temporary Steam API unavailability</li>
                <li>Network connectivity issues</li>
                <li>Server-side caching problems</li>
              </ul>
              <p className="text-gray-300">
                Please try again later or return to the{' '}
                <Link href="/" className="text-blue-400 hover:underline">
                  home page
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </Container>
        <Footer />
      </div>
    );
  }
}
