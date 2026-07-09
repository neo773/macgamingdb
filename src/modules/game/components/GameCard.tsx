'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type PerformanceRating } from '@macgamingdb/server/drizzle/types';
import { useState } from 'react';
import { LogoIcon } from '@/modules/layout/components/LogoIcon';
import { trpc } from '@/lib/trpc/provider';

type GameCardGame = {
  objectID: string;
  slug?: string | null;
  name: string;
  url?: string;
  tagIds?: string[];
  source?: 'steam' | 'igdb';
  igdbId?: number;
  coverImage?: string;
  releaseYear?: number;
  performanceRating?: PerformanceRating;
};

export function GameCard({ game }: { game: GameCardGame }) {
  const router = useRouter();
  const isIgdb = game.source === 'igdb';

  const [showFallback, setShowFallback] = useState(false);
  const [steamApiImageUrl, setSteamApiImageUrl] = useState<string | null>(null);
  const [steamApiImageReady, setSteamApiImageReady] = useState(false);

  const { refetch: fetchCoverArt } = trpc.game.getCoverArt.useQuery(
    { gameId: game.objectID },
    { enabled: false, retry: false }
  );

  const materialize = trpc.game.getOrCreateFromIGDB.useMutation();

  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = url;
    });
  };

  const handleImageLoadError = async () => {
    setShowFallback(true);

    if (isIgdb || steamApiImageUrl) return;

    try {
      const result = await fetchCoverArt();
      const headerImage = result.data?.headerImage;

      if (!headerImage) return;

      setSteamApiImageUrl(headerImage);
      await preloadImage(headerImage);
      setSteamApiImageReady(true);
      setShowFallback(false);
    } catch (error) {
      console.error('Failed to fetch fallback cover art:', error);
    }
  };

  const imageSource = isIgdb
    ? game.coverImage ?? ''
    : steamApiImageReady && steamApiImageUrl
      ? steamApiImageUrl
      : `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.objectID}/header.jpg`;

  const handleIgdbClick = () => {
    if (materialize.isPending || game.igdbId === undefined) return;

    materialize.mutate(
      { igdbId: game.igdbId },
      {
        onSuccess: (result) => {
          router.push(`/games/${result.slug ?? result.id}`);
        },
      }
    );
  };

  const cardInner = (
    <>
      <div className="aspect-[460/215] rounded-xl overflow-hidden relative ring-1 ring-gray-800 shadow-lg shadow-blue-900/20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

        {showFallback ? (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <LogoIcon width={60} height={60} className="opacity-60" />
          </div>
        ) : (
          <img
            src={imageSource}
            alt={`${game.name} cover art`}
            className="w-full h-full object-cover"
            onError={handleImageLoadError}
          />
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-transparent">
        <div className="font-medium text-white group-hover:text-blue-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
          {game.name}
          {game.releaseYear !== undefined && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              {game.releaseYear}
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (isIgdb) {
    return (
      <button
        type="button"
        onClick={handleIgdbClick}
        disabled={materialize.isPending}
        aria-busy={materialize.isPending}
        className="relative group cursor-pointer transition-transform duration-200 hover:scale-105 block w-full text-left disabled:pointer-events-none disabled:opacity-70"
      >
        {cardInner}
      </button>
    );
  }

  return (
    <Link
      href={`/games/${game.slug ?? game.objectID}`}
      className="relative group cursor-pointer transition-transform duration-200 hover:scale-105 block"
    >
      {cardInner}
    </Link>
  );
}
