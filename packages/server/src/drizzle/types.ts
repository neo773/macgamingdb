import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import {
  users,
  games,
  macConfigs,
  gameReviews,
  sessions,
  accounts,
  verifications,
} from './schema';

// Select types (what you get back from queries)
export type User = InferSelectModel<typeof users>;
export type Game = InferSelectModel<typeof games>;
export type MacConfig = InferSelectModel<typeof macConfigs>;
export type GameReview = InferSelectModel<typeof gameReviews>;
export type Session = InferSelectModel<typeof sessions>;
export type Account = InferSelectModel<typeof accounts>;
export type Verification = InferSelectModel<typeof verifications>;

// Insert types (what you pass to insert)
export type NewUser = InferInsertModel<typeof users>;
export type NewGame = InferInsertModel<typeof games>;
export type NewMacConfig = InferInsertModel<typeof macConfigs>;
export type NewGameReview = InferInsertModel<typeof gameReviews>;
export type NewSession = InferInsertModel<typeof sessions>;
export type NewAccount = InferInsertModel<typeof accounts>;
export type NewVerification = InferInsertModel<typeof verifications>;

// Re-export enum types from schema
export {
  type PerformanceRating,
  type PlayMethod,
  type TranslationLayer,
  type GraphicsSetting,
  type ChipsetVariant,
} from './schema';
