import Link from "next/link";
import { createServerHelpers } from "@/lib/trpc/server";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import AddReviewDialog from "./AddReviewDialog";
import ExpandableDescription from "./ExpandableDescription";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import * as React from "react";
import { SVGProps } from "react";
import { ArrowLeft, ChevronLeft, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/footer";
import Header from "@/components/header";

// Enable ISR with a revalidation time of 1 hour
export const revalidate = 3600;

// Generate metadata for SEO
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;

  try {
    const helpers = await createServerHelpers();
    const { game } = await helpers.game.getById.fetch({ id });

    return {
      title: `${game.name} - Mac Gaming Performance`,
      description: `Mac performance details and user reviews for ${game.name}. Find out how well it runs on Apple Silicon.`,
      openGraph: {
        title: `${game.name} - Mac Gaming Performance`,
        description: `Mac performance details and user reviews for ${game.name}. Find out how well it runs on Apple Silicon.`,
        type: "website",
      },
    };
  } catch (error) {
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

    // Helper function to get performance color
    const getPerformanceColor = (performance: string) => {
      const colors: Record<string, string> = {
        EXCELLENT: "bg-green-500 text-green-50",
        GOOD: "bg-blue-500 text-blue-50",
        PLAYABLE: "bg-yellow-500 text-yellow-900",
        BARELY_PLAYABLE: "bg-orange-500 text-orange-50",
        UNPLAYABLE: "bg-red-500 text-red-50",
      };
      return colors[performance] || "bg-gray-500 text-gray-50";
    };

    // Helper function to format method name
    const formatMethodName = (method: string) => {
      const formats: Record<string, string> = {
        NATIVE: "Native",
        CROSSOVER: "CrossOver",
        PARALLELS: "Parallels",
        OTHER: "Other",
      };
      return formats[method] || method;
    };

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
              <img
                src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${id}/header.jpg`}
                alt={game.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {game.name}
                </h1>
                {game.release_date && (
                  <p className="text-gray-300">
                    Released: {game.release_date.date}
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
                    description={game.detailed_description}
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
                <AddReviewDialog gameId={id} gameName={game.name} />
              )}
            </div>

            {reviews && reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="bg-primary-gradient overflow-hidden"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex gap-4">
                            <img
                              src={`/images/${review.playMethod.toLowerCase()}.png`}
                              alt={formatMethodName(review.playMethod)}
                              className="size-16 object-contain"
                            />
                            <div className="flex flex-col justify-between -mt-1">
                              <p className="font-medium text-white text-lg">
                                {formatMethodName(review.playMethod)}
                              </p>

                              {review.softwareVersion && (
                                <span className="text-gray-400 text-xs ml-1 -mt-[5px]">
                                  v{review.softwareVersion}
                                </span>
                              )}

                              <div className="flex gap-2">
                                {review.translationLayer && (
                                  <Badge variant="secondary">
                                    {review.translationLayer}
                                  </Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className={`${getPerformanceColor(
                                    review.performance,
                                  )}`}
                                >
                                  {review.performance.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <img
                          src={`/images/chipsets/${review.chipset.toLowerCase()}/${review.chipsetVariant.toLowerCase()}.png`}
                          alt="M3 Max Chip"
                          className="w-[70px] object-contain"
                        />
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="border-t border-white/15 pt-3 pb-2">
                        <dl className="space-y-2 text-sm text-gray-300">
                          <div className="flex justify-between">
                            <dt className="font-medium">Graphics:</dt>
                            <dd className="font-semibold text-white font-mono">
                              {review.graphicsSettings}
                            </dd>
                          </div>

                          {review.fps && (
                            <div className="flex justify-between">
                              <dt className="font-medium">FPS:</dt>
                              <dd className="font-semibold text-white font-mono">
                                {review.fps}
                              </dd>
                            </div>
                          )}

                          {review.resolution && (
                            <div className="flex justify-between">
                              <dt className="font-medium">Resolution:</dt>
                              <dd className="font-semibold text-white font-mono">
                                {review.resolution}
                              </dd>
                            </div>
                          )}

                          <div className="flex justify-between">
                            <dt className="font-medium">Hardware:</dt>
                            <dd className="font-semibold text-white font-mono">
                              {review.chipset} {review.chipsetVariant}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      {review.notes && (
                        <div className="border-t border-white/15 pt-3 mt-2">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">
                            Review Note:
                          </h4>
                          <div className="bg-[#181818] p-3 rounded-lg text-sm text-white border border-[rgba(255,255,255,0.1)]">
                            <p className="line-clamp-3">{review.notes}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-primary-gradient">
                <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
                  <h1 className="text-xl font-medium">
                    No experience reports yet
                  </h1>
                  <AddReviewDialog gameId={id} gameName={game.name} />
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error in server component:", error);
    notFound();
  }
}
