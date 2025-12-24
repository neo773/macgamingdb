import { createPrismaClient } from '@macgamingdb/server/database';
import { notFound } from 'next/navigation';
import Header from '@/modules/layout/components/Header';
import Footer from '@/modules/layout/components/Footer';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ExpandableReviewNote from '@/modules/review/components/ExpandableReviewNote';
import ScreenshotDisplay from '@/modules/review/components/ScreenshotDisplay';

import { formatDistance } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import GameReviewCard from '@/modules/review/components/ReviewCard';
import { type SteamAppData } from '@macgamingdb/server/api/steam';
import { Container } from '@/components/ui/container';

export default async function ContributorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const prisma = createPrismaClient();

  const { id: contributorId } = await params;

  const contributor = await prisma.user.findUnique({
    where: {
      id: contributorId,
    },
  });

  if (!contributor) {
    notFound();
  }

  const contributorReviews = await prisma.gameReview.findMany({
    where: {
      userId: contributorId,
    },
    include: {
      game: true,
      macConfig: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const contributorName = contributor
    .email!.split('@')[0]
    .replace(/[0-9._]/g, '');

  const uniqueGamesCount = new Set(
    contributorReviews.map((review) => review.gameId),
  ).size;

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <Container>
        <div className="mb-4">
          <Link
            href="/contributors"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center"
          >
            <ChevronLeft className="text-blue-400" />
            Back to Contributors
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white capitalize">
              {contributorName} Reviews
            </h1>
            <p className="text-gray-400">
              {contributorReviews.length} reviews across {uniqueGamesCount}{' '}
              games
            </p>
          </div>
        </div>
        <div>
          {contributorReviews.length === 0 ? (
            <Card className="bg-primary-gradient">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <h2 className="text-xl font-medium text-white">
                  This contributor hasn't submitted any game reviews yet
                </h2>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contributorReviews.map((review) => {
                const gameDetails = JSON.parse(
                  review.game.details ?? '{}',
                ) as SteamAppData;
                return (
                  <div key={review.id}>
                    <GameReviewCard
                      review={review}
                      className="pt-0"
                      header={
                        <div className="aspect-[460/215] relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                          <img
                            src={`${gameDetails.header_image}`}
                            alt={`${gameDetails.name} cover art`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                            <Link href={`/games/${review.gameId}`}>
                              <h3 className="text-lg font-semibold text-white hover:text-blue-300 transition-colors">
                                {gameDetails.name || 'Unknown Game'}
                              </h3>
                            </Link>
                            <div className="text-sm text-gray-300 mt-1">
                              Reviewed{' '}
                              {formatDistance(
                                new Date(review.createdAt),
                                new Date(),
                                { addSuffix: true },
                              )}
                            </div>
                          </div>
                        </div>
                      }
                      customReviewNote={
                        <>
                          {review.notes && (
                            <div className="border-t border-white/15 pt-3 mt-2">
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">
                                  Review Note:
                                </h4>
                                <ExpandableReviewNote
                                  notes={review.notes}
                                  screenshots={
                                    review.screenshots
                                      ? JSON.parse(review.screenshots)
                                      : undefined
                                  }
                                />
                              </div>
                            </div>
                          )}
                          {review.notes === null &&
                            review.screenshots &&
                            review.screenshots.length > 0 && (
                              <div className="border-t border-white/15 pt-3 mt-2">
                                <h4 className="text-sm font-medium text-gray-300">
                                  Screenshots:
                                </h4>
                                <ScreenshotDisplay
                                  screenshots={
                                    review.screenshots
                                      ? JSON.parse(review.screenshots)
                                      : undefined
                                  }
                                />
                              </div>
                            )}
                        </>
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>

      <Footer />
    </div>
  );
}
