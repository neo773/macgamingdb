import { z } from 'zod';
import { router, procedure } from '../trpc';
import { getGameById } from '@/lib/algolia';

// Add proper search function
// This will need to be implemented in the algolia.ts file
async function searchGames(query: string) {
  try {
    // This is a placeholder - implement the actual search in @/lib/algolia
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/games/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return { games: data.games || [] };
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search games');
  }
}

export const gameRouter = router({
  search: procedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      try {
        return await searchGames(input.query);
      } catch (error) {
        console.error('Search error:', error);
        throw new Error('Failed to search games');
      }
    }),

  getById: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        // Get game details from Algolia
        const gameDetails = await getGameById(input.id);
        
        if (!gameDetails) {
          throw new Error('Game not found');
        }
        
        // Get reviews from our database
        const reviews = await ctx.prisma.gameReview.findMany({
          where: { gameId: input.id }
        });
        
        // Calculate average ratings
        const reviewStats = reviews.length > 0 
          ? {
              totalReviews: reviews.length,
              methods: {
                native: reviews.filter(r => r.playMethod === 'NATIVE').length,
                crossover: reviews.filter(r => r.playMethod === 'CROSSOVER').length,
                parallels: reviews.filter(r => r.playMethod === 'PARALLELS').length,
                other: reviews.filter(r => r.playMethod === 'OTHER').length,
              },
              averagePerformance: calculateAveragePerformance(reviews),
              translationLayers: calculateTranslationLayerStats(reviews)
            }
          : null;
        
        return { 
          game: gameDetails,
          reviews,
          stats: reviewStats
        };
      } catch (error) {
        console.error(`Error fetching game details for ID ${input.id}:`, error);
        throw new Error('Failed to fetch game details');
      }
    })
});

// Helper function to calculate average performance
function calculateAveragePerformance(reviews: any[]) {
  const performanceMap = {
    'UNPLAYABLE': 0,
    'BARELY_PLAYABLE': 1,
    'PLAYABLE': 2,
    'GOOD': 3,
    'EXCELLENT': 4
  };
  
  const sum = reviews.reduce((acc, review) => {
    return acc + performanceMap[review.performance as keyof typeof performanceMap];
  }, 0);
  
  return reviews.length > 0 ? sum / reviews.length : 0;
}

// Helper function to calculate translation layer statistics
function calculateTranslationLayerStats(reviews: any[]) {
  const layers = ['DXVK', 'DXMT', 'D3D_METAL', 'NONE'];
  const stats: Record<string, { count: number, averagePerformance: number }> = {};
  
  layers.forEach(layer => {
    const layerReviews = reviews.filter(r => r.translationLayer === layer);
    stats[layer] = {
      count: layerReviews.length,
      averagePerformance: calculateAveragePerformance(layerReviews)
    };
  });
  
  return stats;
} 