import { SteamGame } from '@/lib/algolia';
import { Prisma } from '@prisma/client';
import Link from 'next/link';

// Type for combined game data from API
type GameDetails = {
  game: SteamGame;
  reviews: any[];
  stats: {
    totalReviews: number;
    methods: {
      native: number;
      crossover: number;
      parallels: number;
      other: number;
    };
    averagePerformance: number;
    translationLayers: Record<string, { count: number; averagePerformance: number }>;
  } | null;
};

// Convert performance number to rating text
function performanceToText(rating: number): string {
  if (rating >= 3.5) return 'Excellent';
  if (rating >= 2.5) return 'Good';
  if (rating >= 1.5) return 'Playable';
  if (rating >= 0.5) return 'Barely Playable';
  return 'Unplayable';
}

// Get color class based on performance rating
function getPerformanceColorClass(rating: number): string {
  if (rating >= 3.5) return 'text-green-500';
  if (rating >= 2.5) return 'text-lime-500';
  if (rating >= 1.5) return 'text-yellow-500';
  if (rating >= 0.5) return 'text-orange-500';
  return 'text-red-500';
}

async function getGameDetails(id: string): Promise<GameDetails> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/games/${id}`, { 
    cache: 'no-store' 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch game details');
  }
  
  return res.json();
}

export default async function GamePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const gameData = await getGameDetails(id);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href="/" 
          className="text-blue-500 hover:text-blue-700 inline-flex items-center"
        >
          ← Back to search
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{gameData.game.name}</h1>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {gameData.game.tags?.slice(0, 5).map((tag, index) => (
            <span 
              key={index} 
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Game Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Release Year:</span> {gameData.game.releaseYear || 'Unknown'}</p>
              <p><span className="font-medium">Steam ID:</span> {gameData.game.objectID}</p>
              <p><span className="font-medium">User Score:</span> {gameData.game.userScore ? `${gameData.game.userScore.toFixed(1)}/10` : 'N/A'}</p>
              <p>
                <span className="font-medium">Platforms:</span>{' '}
                {gameData.game.oslist?.join(', ') || 'Unknown'}
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Mac Compatibility</h2>
            {gameData.stats ? (
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-1">Overall Rating:</p>
                  <div className={`text-2xl font-bold ${getPerformanceColorClass(gameData.stats.averagePerformance)}`}>
                    {performanceToText(gameData.stats.averagePerformance)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Based on {gameData.stats.totalReviews} user {gameData.stats.totalReviews === 1 ? 'report' : 'reports'}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Play Methods:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(gameData.stats.methods).map(([method, count]) => (
                      count > 0 && (
                        <div key={method} className="flex justify-between">
                          <span className="capitalize">{method}:</span>
                          <span>{count}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No compatibility reports yet. Be the first to add one!
              </p>
            )}
          </div>
        </div>
      </div>
      
      {gameData.stats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Translation Layer Performance</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left">Layer</th>
                  <th className="px-4 py-2 text-left">Reports</th>
                  <th className="px-4 py-2 text-left">Performance</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(gameData.stats.translationLayers).map(([layer, data]) => (
                  data.count > 0 && (
                    <tr key={layer} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3">{layer === 'NONE' ? 'Native' : layer}</td>
                      <td className="px-4 py-3">{data.count}</td>
                      <td className="px-4 py-3">
                        <span className={getPerformanceColorClass(data.averagePerformance)}>
                          {performanceToText(data.averagePerformance)}
                        </span>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">User Reports</h2>
          <Link
            href={`/games/${id}/add-review`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add your experience
          </Link>
        </div>
        
        {gameData.reviews.length > 0 ? (
          <div className="space-y-6">
            {gameData.reviews.map((review) => (
              <div key={review.id} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex flex-wrap justify-between mb-2">
                  <div className="font-medium">
                    Play Method: <span className="capitalize">{review.playMethod.toLowerCase()}</span>
                    {review.translationLayer && review.translationLayer !== 'NONE' && (
                      <span> / {review.translationLayer}</span>
                    )}
                  </div>
                  <div className={getPerformanceColorClass(
                    ['UNPLAYABLE', 'BARELY_PLAYABLE', 'PLAYABLE', 'GOOD', 'EXCELLENT'].indexOf(review.performance)
                  )}>
                    {review.performance.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="font-medium">Hardware:</span> {review.chipset} {review.chipsetVariant.toLowerCase()}
                  </div>
                  {review.fps && (
                    <div>
                      <span className="font-medium">FPS:</span> {review.fps}
                    </div>
                  )}
                  {review.resolution && (
                    <div>
                      <span className="font-medium">Resolution:</span> {review.resolution}
                    </div>
                  )}
                  {review.graphicsSettings && (
                    <div>
                      <span className="font-medium">Graphics:</span> {review.graphicsSettings.toLowerCase()}
                    </div>
                  )}
                </div>
                
                {review.notes && (
                  <div className="mt-2 text-gray-600 dark:text-gray-400">
                    {review.notes}
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  Posted on {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No user reports yet for this game.</p>
            <p>Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
} 