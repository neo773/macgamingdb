import { z } from 'zod';
import { router, procedure } from '../trpc';
import { getGameById } from '@/lib/algolia';

// Define schemas using Zod
const createReviewSchema = z.object({
  gameId: z.string(),
  userId: z.string(),
  playMethod: z.enum(['NATIVE', 'CROSSOVER', 'PARALLELS', 'OTHER']),
  translationLayer: z.enum(['DXVK', 'DXMT', 'D3D_METAL', 'NONE']).nullable(),
  performance: z.enum(['EXCELLENT', 'GOOD', 'PLAYABLE', 'BARELY_PLAYABLE', 'UNPLAYABLE']),
  fps: z.number().nullable().optional(),
  graphicsSettings: z.enum(['ULTRA', 'HIGH', 'MEDIUM', 'LOW']),
  resolution: z.string().optional(),
  chipset: z.enum(['M1', 'M2', 'M3']),
  chipsetVariant: z.enum(['BASE', 'PRO', 'MAX', 'ULTRA']),
  notes: z.string().optional(),
});

export const reviewRouter = router({
  create: procedure
    .input(createReviewSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate the game exists in Algolia
        const gameExists = await getGameById(input.gameId);
        if (!gameExists) {
          throw new Error('Game not found');
        }
        
        // Create the game entry if it doesn't exist in our database
        await ctx.prisma.game.upsert({
          where: { id: input.gameId },
          update: {},
          create: { id: input.gameId }
        });
        
        // Create the review
        const review = await ctx.prisma.gameReview.create({
          data: {
            gameId: input.gameId,
            userId: input.userId,
            playMethod: input.playMethod,
            translationLayer: input.translationLayer,
            performance: input.performance,
            fps: input.fps,
            graphicsSettings: input.graphicsSettings,
            resolution: input.resolution || null,
            chipset: input.chipset,
            chipsetVariant: input.chipsetVariant,
            notes: input.notes || null,
          }
        });
        
        return { review };
      } catch (error) {
        console.error('Error creating review:', error);
        throw new Error('Failed to create review');
      }
    })
}); 