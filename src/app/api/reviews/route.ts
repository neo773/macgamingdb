import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGameById } from '@/lib/algolia';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const { 
      gameId, 
      userId, 
      playMethod, 
      translationLayer, 
      performance, 
      fps,
      graphicsSettings,
      resolution,
      chipset,
      chipsetVariant,
      notes 
    } = body;
    
    if (!gameId || !userId || !playMethod || !performance || !chipset || !chipsetVariant) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Validate the game exists in Algolia
    const gameExists = await getGameById(gameId);
    if (!gameExists) {
      return NextResponse.json(
        { error: 'Game not found' }, 
        { status: 404 }
      );
    }
    
    // Create the game entry if it doesn't exist in our database
    await prisma.game.upsert({
      where: { id: gameId },
      update: {},
      create: { id: gameId }
    });
    
    // Create the review
    const review = await prisma.gameReview.create({
      data: {
        gameId,
        userId,
        playMethod,
        translationLayer,
        performance,
        fps,
        graphicsSettings,
        resolution,
        chipset,
        chipsetVariant,
        notes
      }
    });
    
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' }, 
      { status: 500 }
    );
  }
} 