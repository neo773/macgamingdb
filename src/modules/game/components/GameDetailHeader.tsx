import { type RouterOutputs } from '@/lib/trpc/provider';

interface GameDetailHeaderProps {
  game: RouterOutputs['game']['getById']['game'];
}

export function GameDetailHeader({ game }: GameDetailHeaderProps) {
  return (
    <div className="relative mb-8">
      <div className="aspect-[3/1] rounded-xl overflow-hidden relative ring-1 ring-gray-800 shadow-lg shadow-blue-900/20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
        {game.headerImage ? (
          <img
            src={game.headerImage}
            alt={`${game.name} cover art`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <p className="text-gray-400">Game image unavailable</p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
          <h1 className="text-4xl font-bold text-white mb-2">{game.name}</h1>
          {game.publishers && game.publishers.length > 0 && (
            <p className="text-gray-300">Publisher: {game.publishers.join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
