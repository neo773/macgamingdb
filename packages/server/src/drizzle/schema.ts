import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Enum-like const objects (SQLite has no native enums)
export const PlayMethod = {
  NATIVE: 'NATIVE',
  CROSSOVER: 'CROSSOVER',
  PARALLELS: 'PARALLELS',
  OTHER: 'OTHER',
} as const;
export type PlayMethod = (typeof PlayMethod)[keyof typeof PlayMethod];

export const TranslationLayer = {
  DXVK: 'DXVK',
  DXMT: 'DXMT',
  D3D_METAL: 'D3D_METAL',
  NONE: 'NONE',
} as const;
export type TranslationLayer = (typeof TranslationLayer)[keyof typeof TranslationLayer];

export const PerformanceRating = {
  UNPLAYABLE: 'UNPLAYABLE',
  BARELY_PLAYABLE: 'BARELY_PLAYABLE',
  PLAYABLE: 'PLAYABLE',
  GOOD: 'GOOD',
  VERY_GOOD: 'VERY_GOOD',
  EXCELLENT: 'EXCELLENT',
} as const;
export type PerformanceRating = (typeof PerformanceRating)[keyof typeof PerformanceRating];

export const GraphicsSetting = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  ULTRA: 'ULTRA',
} as const;
export type GraphicsSetting = (typeof GraphicsSetting)[keyof typeof GraphicsSetting];

export const ChipsetVariant = {
  BASE: 'BASE',
  PRO: 'PRO',
  MAX: 'MAX',
  ULTRA: 'ULTRA',
} as const;
export type ChipsetVariant = (typeof ChipsetVariant)[keyof typeof ChipsetVariant];

// ─── Tables ──────────────────────────────────────────────────────────────────

export const users = sqliteTable('user', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email'),
  name: text('name'),
  createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updatedAt').notNull().$defaultFn(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
  image: text('image'),
}, (table) => [
  uniqueIndex('user_email_key').on(table.email),
]);

export const games = sqliteTable('Game', {
  id: text('id').primaryKey(),
  details: text('details'),
  updatedAt: text('updatedAt').notNull().$defaultFn(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()),
  createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
  aggregatedPerformance: text('aggregatedPerformance').$type<PerformanceRating>(),
  reviewCount: integer('reviewCount').notNull().default(0),
}, (table) => [
  index('Game_aggregatedPerformance_id_idx').on(table.aggregatedPerformance, table.id),
  index('Game_reviewCount_idx').on(table.reviewCount),
  index('Game_aggregatedPerformance_reviewCount_idx').on(table.aggregatedPerformance, table.reviewCount),
]);

export const macConfigs = sqliteTable('MacConfig', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  identifier: text('identifier').notNull(),
  metadata: text('metadata').notNull(),
  createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updatedAt').notNull().$defaultFn(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()),
}, (table) => [
  uniqueIndex('MacConfig_identifier_key').on(table.identifier),
]);

export const gameReviews = sqliteTable('GameReview', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  gameId: text('gameId').notNull().references(() => games.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  playMethod: text('playMethod').$type<PlayMethod>().notNull(),
  translationLayer: text('translationLayer').$type<TranslationLayer>(),
  performance: text('performance').$type<PerformanceRating>().notNull(),
  fps: integer('fps'),
  graphicsSettings: text('graphicsSettings').$type<GraphicsSetting>(),
  resolution: text('resolution'),
  chipset: text('chipset').notNull(),
  chipsetVariant: text('chipsetVariant').$type<ChipsetVariant>().notNull(),
  macConfigId: text('macConfigId').references(() => macConfigs.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  notes: text('notes'),
  screenshots: text('screenshots'),
  softwareVersion: text('softwareVersion'),
  createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updatedAt').$defaultFn(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()),
}, (table) => [
  index('GameReview_gameId_chipset_idx').on(table.gameId, table.chipset),
  index('GameReview_gameId_playMethod_idx').on(table.gameId, table.playMethod),
  index('GameReview_gameId_chipset_chipsetVariant_idx').on(table.gameId, table.chipset, table.chipsetVariant),
  index('GameReview_gameId_chipset_playMethod_idx').on(table.gameId, table.chipset, table.playMethod),
  index('GameReview_macConfigId_idx').on(table.macConfigId),
  index('GameReview_chipset_chipsetVariant_playMethod_performance_idx').on(table.chipset, table.chipsetVariant, table.playMethod, table.performance),
]);

export const sessions = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: text('expiresAt').notNull(),
  token: text('token').notNull(),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => [
  uniqueIndex('session_token_key').on(table.token),
]);

export const accounts = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: text('accessTokenExpiresAt'),
  refreshTokenExpiresAt: text('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});

export const verifications = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: text('expiresAt').notNull(),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(gameReviews),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  reviews: many(gameReviews),
}));

export const macConfigsRelations = relations(macConfigs, ({ many }) => ({
  reviews: many(gameReviews),
}));

export const gameReviewsRelations = relations(gameReviews, ({ one }) => ({
  game: one(games, { fields: [gameReviews.gameId], references: [games.id] }),
  user: one(users, { fields: [gameReviews.userId], references: [users.id] }),
  macConfig: one(macConfigs, { fields: [gameReviews.macConfigId], references: [macConfigs.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));
