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

// Game controller icon component
const GameIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 231.062 144.438"
    {...props}
  >
    <path
      fill={props.fill || "#fff"}
      fillOpacity={0.85}
      d="M49.063 56c0-3.5 2.187-5.75 5.937-5.75h16.25V34.062c0-3.624 2.125-5.874 5.688-5.874 3.437 0 5.562 2.25 5.562 5.875V50.25h15.625c3.937 0 6.313 2.25 6.313 5.75 0 3.688-2.376 5.938-6.313 5.938H82.5v16.25c0 3.624-2.125 5.874-5.563 5.874-3.562 0-5.687-2.25-5.687-5.874v-16.25H55c-3.75 0-5.938-2.25-5.938-5.938Zm117.687-1.25c-6.312 0-11.562-5.125-11.562-11.563 0-6.437 5.25-11.562 11.562-11.562 6.438 0 11.625 5.125 11.625 11.563 0 6.437-5.187 11.562-11.625 11.562Zm-24.812 24.625a11.536 11.536 0 0 1-11.563-11.563c0-6.374 5.187-11.562 11.563-11.562 6.437 0 11.624 5.188 11.624 11.563 0 6.437-5.187 11.562-11.624 11.562ZM29.813 144.438c10.375 0 18.062-3.938 24.687-12.126l14.875-18c2.125-2.562 4.5-3.75 7.063-3.75h78.187c2.563 0 4.937 1.188 7.063 3.75l14.812 18c6.688 8.188 14.375 12.126 24.75 12.126 17.875 0 29.812-11.938 29.812-30.25 0-7.876-1.874-17-5-27.5-4.937-16.5-13.562-38.938-21.874-56.5-6.813-14.25-10.25-20.5-26.813-24.25C161.938 2.374 140.812.125 115.5.125c-25.25 0-46.375 2.25-61.813 5.813-16.562 3.75-20 10-26.812 24.25-8.313 17.562-16.938 40-21.875 56.5-3.125 10.5-5 19.624-5 27.5 0 18.312 11.938 30.25 29.813 30.25Z"
    />
  </svg>
);

// Generate metadata for SEO
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  _parent: ResolvingMetadata
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
        <header className="w-full pt-8 pb-4 px-8 flex justify-center">
          <div className="max-w-7xl w-full">
            <div className="flex items-center justify-center mb-6">
              <GameIcon className="w-10 h-10 mr-2" fill="#fff" />
              <h1 className="text-4xl font-bold text-white">MacGamingDB</h1>
            </div>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto text-center">
              Find out how your favorite games perform on Mac across different
              compatibility layers
            </p>
          </div>
        </header>

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
              <Card className=" shadow-lg mb-8 mt-4 bg-[#1F1F1F]">
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
              <Card className=" shadow-lg mb-8 mt-4 bg-[#1F1F1F]">
      
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
                    <p className="text-gray-400">No experience reports yet</p>
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
                    className="bg-[#1F1F1F] overflow-hidden"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img
                            src={`/images/${review.playMethod.toLowerCase()}.png`}
                            alt={formatMethodName(review.playMethod)}
                            className="size-10 object-contain"
                          />
                          <div>
                            <p className="font-medium text-white">
                              {formatMethodName(review.playMethod)}
                            </p>
                            {review.translationLayer && (
                              <Badge variant="secondary" className="mt-1">
                                {review.translationLayer}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getPerformanceColor(
                            review.performance
                          )}`}
                        >
                          {review.performance.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="border-t border-white/20 pt-3 pb-2">
                        <dl className="space-y-2 text-sm text-gray-300">
                          <div className="flex justify-between">
                            <dt className="font-medium">Graphics:</dt>
                            <dd>{review.graphicsSettings}</dd>
                          </div>

                          {review.fps && (
                            <div className="flex justify-between">
                              <dt className="font-medium">FPS:</dt>
                              <dd>{review.fps}</dd>
                            </div>
                          )}

                          {review.resolution && (
                            <div className="flex justify-between">
                              <dt className="font-medium">Resolution:</dt>
                              <dd>{review.resolution}</dd>
                            </div>
                          )}

                          <div className="flex justify-between">
                            <dt className="font-medium">Hardware:</dt>
                            <dd>
                              {review.chipset} {review.chipsetVariant}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      {review.notes && (
                        <div className="border-t border-white/20 pt-3 mt-2">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">
                            Review Note:
                          </h4>
                          <div className="bg-[#363636] p-3 rounded-lg text-sm text-gray-300">
                            <p className="line-clamp-3">{review.notes}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-[#1F1F1F]">
                <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
                  <h1 className="text-xl font-medium">No experience reports yet</h1>
                  <AddReviewDialog gameId={id} gameName={game.name} />
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <footer className="mt-auto w-full py-4 border-t border-gray-900 text-center text-gray-600">
          <p>
            © {new Date().getFullYear()} MacGamingDB - A community resource for
            Mac gamers
          </p>
        </footer>
      </div>
    );
  } catch (error) {
    console.error("Error in server component:", error);
    notFound();
  }
}
