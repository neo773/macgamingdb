import { redirect } from "next/navigation";
import { createPrismaClient } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

export default async function MyReviewsPage() {
  const prisma = createPrismaClient(
    process.env.NODE_ENV === "production"
      ? new PrismaLibSQL({
          url: `${process.env.LIBSQL_DATABASE_URL}`,
          authToken: `${process.env.LIBSQL_DATABASE_TOKEN}`,
        })
      : undefined
  );

  const session = await auth(prisma).api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return <div>Not authenticated</div>;
  }

  const userReviews = await prisma.gameReview.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      game: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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
      
        <h1 className="text-3xl font-bold mb-8 text-white">My Game Reviews</h1>

        {userReviews.length === 0 ? (
          <Card className="bg-primary-gradient">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
              <h2 className="text-xl font-medium text-white">You haven't submitted any game reviews yet</h2>
              <Link href="/">
                <Button>Browse Games</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userReviews.map((review) => (
              <Card
                key={review.id}
                className="bg-primary-gradient overflow-hidden"
              >
                <div className="aspect-[460/215] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                  <img
                    src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${review.gameId}/header.jpg`}
                    alt={review.game.id}
                    className="w-full h-full object-cover"
                    // onError={(e) => {
                    //   (e.target as HTMLImageElement).src = "/placeholder-game.jpg";
                    // }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <Link href={`/games/${review.gameId}`}>
                      {/* <h2 className="text-xl font-semibold text-white hover:text-blue-400 transition">
                        {review.game.id}
                      </h2> */}
                    </Link>
                    <div className="text-sm text-gray-300 mt-1">
                      Reviewed {formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                
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
                              className={`${getPerformanceColor(review.performance)}`}
                            >
                              {review.performance.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <img
                      src={`/images/chipsets/${review.chipset.toLowerCase()}/${review.chipsetVariant.toLowerCase()}.png`}
                      alt={`${review.chipset} ${review.chipsetVariant}`}
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
        )}
      </main>
      <Footer />
    </div>
  );
}
