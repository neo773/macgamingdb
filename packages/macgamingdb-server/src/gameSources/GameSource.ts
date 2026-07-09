export const GAME_SOURCES = ['steam', 'igdb'] as const;

export type GameSource = (typeof GAME_SOURCES)[number];
