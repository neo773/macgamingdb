import { router } from '../trpc';
import { gameRouter } from './game';
import { reviewRouter } from './review';
import { contributorRouter } from './contributor';
import { trafficRouter } from './traffic';

export const appRouter = router({
  game: gameRouter,
  review: reviewRouter,
  contributor: contributorRouter,
  traffic: trafficRouter,
});

export type AppRouter = typeof appRouter;
