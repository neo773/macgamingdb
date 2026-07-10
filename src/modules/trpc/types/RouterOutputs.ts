import { type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from 'macgamingdb-server/generated';

export type RouterOutputs = inferRouterOutputs<AppRouter>;
