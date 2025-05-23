import Link from "next/link";
import { SteamGameSearchObject } from "@/server/helpers/steam";
import { PerformanceRating } from "@prisma/client";
import { useState } from "react";
import { LogoIcon } from "../shared/LogoIcon";

export function GameCard({
  game,
}: {
  game: SteamGameSearchObject & { performanceRating?: PerformanceRating };
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/games/${game.objectID}`}
      className="relative group cursor-pointer transition-transform duration-200 hover:scale-105 block"
    >
      <div className="aspect-[460/215] rounded-xl overflow-hidden relative ring-1 ring-gray-800 shadow-lg shadow-blue-900/20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />
        {!imageError ? (
          <img
            src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.objectID}/header.jpg`}
            alt={`${game.name} cover art`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <LogoIcon width={60} height={60} className="opacity-60" />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-transparent">
        <div className="font-medium text-white group-hover:text-blue-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
          {game.name}
        </div>
      </div>
    </Link>
  );
}
