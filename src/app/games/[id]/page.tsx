import Link from "next/link";
import { createServerHelpers } from "@/lib/trpc/server";
import { Metadata, ResolvingMetadata } from "next";
import CreateReviewDialog from "@/components/review/CreateReviewDialog";
import ExpandableDescription from "@/components/review/ExpandableDescription";
import { Card, CardContent } from "@/components/ui/card";
import * as React from "react";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import GameReviewCard from "@/components/review/ReviewCard";
import { SteamAppData } from "@/server/helpers/steam";

// Enable ISR with a revalidation time of 1 year
export const revalidate = 31536000;

// Generate metadata for SEO
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;

  try {
    const helpers = await createServerHelpers();
    const { game } = await helpers.game.getById.fetch({ id });

    // Add robust error handling for JSON parsing
    let gameDetails: SteamAppData;
    try {
      gameDetails = JSON.parse(game?.details || "{}") as SteamAppData;
    } catch (parseError) {
      console.error("Failed to parse game details in metadata:", parseError);
      return {
        title: "Game Details - Mac Gaming DB",
        description: "Details about game performance on Mac",
      };
    }

    return {
      title: `${gameDetails.name || 'Game'} - Mac Gaming Performance`,
      description: `Mac performance details and user reviews for ${gameDetails.name || 'this game'}. Find out how well it runs on Apple Silicon.`,
      openGraph: {
        title: `${gameDetails.name || 'Game'} - Mac Gaming Performance`,
        description: `Mac performance details and user reviews for ${gameDetails.name || 'this game'}. Find out how well it runs on Apple Silicon.`,
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Game Details - Mac Gaming DB",
      description: "Details about game performance on Mac",
    };
  }
}

// This is a Server Component that will be rendered on the server
export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Create server-side tRPC helpers
  const helpers = await createServerHelpers();

  try {
    // Fetch the query data
    const { game, reviews, stats } = await helpers.game.getById.fetch({ id });

    // Add robust error handling for JSON parsing
    let gameDetails: SteamAppData;
    try {
      gameDetails = JSON.parse(game?.details || "{}") as SteamAppData;
    } catch (parseError) {
      console.error("Failed to parse game details:", parseError, game?.details);
      // Provide an empty object with fallback properties instead of showing a 404
      gameDetails = {
        name: "Game Information Unavailable",
        detailed_description: "Game details could not be loaded at this time. Please try again later.",
        header_image: "",
        release_date: { date: "Unknown", coming_soon: false },
      } as SteamAppData;
    }

    // Only show affiliate if there are reviews, game is playable, and someone used CrossOver
    const hasReviews = reviews && reviews.length > 0;
    const isPlayable =
      stats &&
      typeof stats.averagePerformance === "number" &&
      stats.averagePerformance > 1.0;
    const hasCrossoverReview =
      stats &&
      stats.methods &&
      typeof stats.methods.crossover === "number" &&
      stats.methods.crossover > 0;
    const showCrossoverAffiliate =
      hasReviews && isPlayable && hasCrossoverReview;

    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-8">
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
                  {gameDetails.name || "Game Information Unavailable"}
                </h1>
                {gameDetails.release_date && (
                  <p className="text-gray-300">
                    Released: {gameDetails.release_date.date}
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
                    description={gameDetails.detailed_description || "No description available."}
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
                                  (stats.averagePerformance / 4) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-white">
                            {stats.averagePerformance.toFixed(1)}/4
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

          {/* Affiliate Link Section */}
          {showCrossoverAffiliate && (
            <div className="mb-6">
              <Card className="bg-primary-gradient border border-[#272727]">
                <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">
                      Want to play this game on your Mac?
                    </h3>
                    <p className="text-gray-300">
                      CrossOver lets you run Windows games on macOS without
                      rebooting.
                    </p>
                  </div>
                  <a
                    href="https://www.codeweavers.com/store?ad=1100"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Get CrossOver
                  </a>
                </CardContent>
              </Card>
              <p className="text-sm text-gray-400 my-2 mx-2">
                <span className="italic">* Affiliate link - purchases support this site and the Mac
                  gaming ecosystem through CodeWeavers' contributions to Wine.
                </span>
              </p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error in server component:", error);
    
    // Instead of notFound(), provide a graceful error page
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-8">
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
                We're having trouble loading the information for this game. This could be due to:
              </p>
              <ul className="list-disc pl-5 text-gray-300 mb-6 space-y-2">
                <li>Temporary Steam API unavailability</li>
                <li>Network connectivity issues</li>
                <li>Server-side caching problems</li>
              </ul>
              <p className="text-gray-300">
                Please try again later or return to the <Link href="/" className="text-blue-400 hover:underline">home page</Link>.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
}
