import { type Performance } from 'macgamingdb-server/schema';

export const PLAYABLE_PERFORMANCES: ReadonlySet<Performance> = new Set([
  'EXCELLENT',
  'VERY_GOOD',
  'GOOD',
  'PLAYABLE',
]);
