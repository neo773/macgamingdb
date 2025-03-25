import Link from 'next/link';
import { createServerHelpers } from '@/lib/trpc/server';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import AddReviewDialog from './AddReviewDialog';

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
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: 'Game Details - Mac Gaming DB',
      description: 'Details about game performance on Mac',
    };
  }
}

// This is a Server Component that will be rendered on the server
export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Create server-side tRPC helpers
  const helpers = await createServerHelpers();
  
  try {
    // Fetch the query data
    const { game, reviews, stats } = await helpers.game.getById.fetch({ id });
    
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Game info section */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
              {game.releaseYear && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">Released: {game.releaseYear}</p>
              )}
              
              
              <div className="mt-6">
                <AddReviewDialog gameId={id} gameName={game.name} />
              </div>
            </div>
          </div>
          
          {/* Stats section */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Mac Performance Stats</h2>
              
              {stats ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Experience Reports</h3>
                    <p className="text-3xl font-bold">{stats.totalReviews}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Play Methods</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Native</span>
                        <span className="font-medium">{stats.methods.native}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CrossOver</span>
                        <span className="font-medium">{stats.methods.crossover}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parallels</span>
                        <span className="font-medium">{stats.methods.parallels}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other</span>
                        <span className="font-medium">{stats.methods.other}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Average Rating</h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(stats.averagePerformance / 4) * 100}%` }}
                        ></div>
                      </div>
                      <span>{stats.averagePerformance.toFixed(1)}/4</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No experience reports yet</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Reviews section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Experience Reports</h2>
          
          {reviews && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex justify-between mb-2">
                    <div>
                      <span className="font-medium">Method: </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {review.playMethod}
                      </span>
                      
                      {review.translationLayer && (
                        <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          {review.translationLayer}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Performance: </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {review.performance}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p><span className="font-medium">Graphics:</span> {review.graphicsSettings}</p>
                      {review.fps && <p><span className="font-medium">FPS:</span> {review.fps}</p>}
                      {review.resolution && <p><span className="font-medium">Resolution:</span> {review.resolution}</p>}
                    </div>
                    <div>
                      <p><span className="font-medium">Hardware:</span> {review.chipset} {review.chipsetVariant}</p>
                    </div>
                  </div>
                  
                  {review.notes && (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-gray-700 dark:text-gray-300">{review.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No experience reports yet</p>
              <AddReviewDialog gameId={id} gameName={game.name} />
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in server component:', error);
    notFound();
  }
} 