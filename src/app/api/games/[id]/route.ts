import { NextRequest, NextResponse } from 'next/server';
import { getGameById } from '@/lib/algolia';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get game details from Algolia
    const gameDetails = await getGameById(id);
    
    if (!gameDetails) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Get reviews from our database
    const reviews = await prisma.gameReview.findMany({
      where: { gameId: id }
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
    
    return NextResponse.json({ 
      game: gameDetails,
      reviews,
      stats: reviewStats
    });
  } catch (error) {
    console.error(`Error fetching game details for ID ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch game details' }, 
      { status: 500 }
    );
  }
}

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