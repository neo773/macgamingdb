import type { CanonicalGenre } from '../types/CanonicalGenre';

export const GENRE_ALIASES: Record<string, CanonicalGenre> = {
  action: 'Action',
  azione: 'Action',
  ação: 'Action',
  экшены: 'Action',
  액션: 'Action',
  "hack and slash/beat 'em up": 'Action',

  adventure: 'Adventure',
  avventura: 'Adventure',
  aventura: 'Adventure',
  'приключенческие игры': 'Adventure',
  'point-and-click': 'Adventure',

  arcade: 'Arcade',

  casual: 'Casual',
  occasionnel: 'Casual',

  indie: 'Indie',
  인디: 'Indie',

  mmo: 'MMO',
  'massively multiplayer': 'MMO',
  'multigiocatore di massa': 'MMO',

  music: 'Music',

  puzzle: 'Puzzle',

  rpg: 'RPG',
  'role-playing (rpg)': 'RPG',
  gdr: 'RPG',

  racing: 'Racing',

  shooter: 'Shooter',

  simulation: 'Simulation',
  simulator: 'Simulation',
  simulazione: 'Simulation',
  simulationen: 'Simulation',
  시뮬레이션: 'Simulation',

  sports: 'Sports',
  sport: 'Sports',

  strategy: 'Strategy',
  strategia: 'Strategy',
  strategie: 'Strategy',
  stratégie: 'Strategy',
  'turn-based strategy (tbs)': 'Strategy',
};
