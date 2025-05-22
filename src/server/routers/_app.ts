import { router } from "../trpc";
import { gameRouter } from "./game";
import { reviewRouter } from "./review";
import { contributorRouter } from "./contributor";

export const appRouter = router({
  game: gameRouter,
  review: reviewRouter,
  contributor: contributorRouter,
});

export type AppRouter = typeof appRouter;
