import { type SteamAppData } from '@macgamingdb/server/api/steam';

interface GameDetailHeaderProps {
  gameDetails: SteamAppData;
}

export function GameDetailHeader({ gameDetails }: GameDetailHeaderProps) {
  return (
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
            <p className="text-gray-300">Publisher: {gameDetails.publishers[0]}</p>
          )}
        </div>
      </div>
    </div>
  );
}
