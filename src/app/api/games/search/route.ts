import { searchGames } from '@/lib/algolia';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const games = await searchGames(query, page, limit);
    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error searching games:', error);
    return NextResponse.json(
      { error: 'Failed to search games' }, 
      { status: 500 }
    );
  }
} 