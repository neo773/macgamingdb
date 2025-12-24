'use client';

import { useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc/provider';
import { formatDistance } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '@macgamingdb/server/routers/_app';

type ContributorsData =
  inferRouterOutputs<AppRouter>['contributor']['getTopContributors'];

export default function ContributorsClient({
  contributorsData,
}: {
  contributorsData: ContributorsData;
}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.contributor.getTopContributors.useInfiniteQuery(
      {
        limit: 21,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialData: {
          pages: [contributorsData],
          pageParams: [undefined],
        },
      },
    );

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  const allContributors =
    data?.pages.flatMap((page) => page.contributors) || [];

  const getRankBadge = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="size-4 text-yellow-400" />;
      case 1:
        return <Medal className="size-4 text-gray-300" />;
      case 2:
        return <Award className="size-4 text-amber-700" />;
      default:
        return <Star className="size-4 text-blue-400" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allContributors.map((contributor, index) => (
          <Link
            href={`/contributors/${contributor.id}`}
            key={contributor.id}
            className="group"
          >
            <Card
              className={`
                overflow-hidden transition-transform duration-300 bg-primary-gradient
                hover:scale-[1.05]  hover:outline hover:outline-blue-400
              `}
            >
              <CardContent className="px-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-white/20 border-2">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className="text-xl text-white bg-white/8">
                        {getInitials(contributor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-primary-gradient rounded-full p-2 shadow-lg border border-white/20">
                      {getRankBadge(index)}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-white truncate max-w-[180px] transition-colors">
                        {contributor.name}
                      </h2>
                      <div className="text-lg font-bold text-white font-mono">
                        #{index + 1}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      Joined{' '}
                      {formatDistance(
                        new Date(contributor.joinedAt),
                        new Date(),
                        { addSuffix: true },
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reviews submitted</span>
                    <span className="font-semibold text-white font-mono">
                      {contributor.reviewCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Games reviewed</span>
                    <span className="font-semibold text-white font-mono">
                      {contributor.uniqueGamesCount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* Loading skeletons */}
        {isFetchingNextPage &&
          Array(6)
            .fill(null)
            .map((_, i) => (
              <Card
                key={`skeleton-${i}`}
                className="bg-black/30 border border-white/10"
              >
                <CardContent className="px-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Load more trigger */}
      {hasNextPage && <div ref={loadMoreRef} className="h-10" />}

      {/* No contributors message */}
      {allContributors.length === 0 && !isLoading && (
        <Card className="bg-primary-gradient">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <h2 className="text-xl font-medium text-white">
              No contributors found
            </h2>
            <p className="text-gray-300">
              Be the first to submit game reviews and appear on this
              leaderboard!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
