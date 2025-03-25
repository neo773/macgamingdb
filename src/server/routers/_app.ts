import { router } from '../trpc';
import { gameRouter } from './game';
import { reviewRouter } from './review';

export const appRouter = router({
  game: gameRouter,
  review: reviewRouter,
});

export type AppRouter = typeof appRouter; 