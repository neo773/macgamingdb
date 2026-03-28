CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` text,
	`refreshTokenExpiresAt` text,
	`scope` text,
	`password` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `GameReview` (
	`id` text PRIMARY KEY NOT NULL,
	`gameId` text NOT NULL,
	`userId` text NOT NULL,
	`playMethod` text NOT NULL,
	`translationLayer` text,
	`performance` text NOT NULL,
	`fps` integer,
	`graphicsSettings` text,
	`resolution` text,
	`chipset` text NOT NULL,
	`chipsetVariant` text NOT NULL,
	`macConfigId` text,
	`notes` text,
	`screenshots` text,
	`softwareVersion` text,
	`createdAt` text NOT NULL,
	`updatedAt` text,
	FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`macConfigId`) REFERENCES `MacConfig`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `GameReview_gameId_chipset_idx` ON `GameReview` (`gameId`,`chipset`);--> statement-breakpoint
CREATE INDEX `GameReview_gameId_playMethod_idx` ON `GameReview` (`gameId`,`playMethod`);--> statement-breakpoint
CREATE INDEX `GameReview_gameId_chipset_chipsetVariant_idx` ON `GameReview` (`gameId`,`chipset`,`chipsetVariant`);--> statement-breakpoint
CREATE INDEX `GameReview_gameId_chipset_playMethod_idx` ON `GameReview` (`gameId`,`chipset`,`playMethod`);--> statement-breakpoint
CREATE INDEX `GameReview_macConfigId_idx` ON `GameReview` (`macConfigId`);--> statement-breakpoint
CREATE INDEX `GameReview_chipset_chipsetVariant_playMethod_performance_idx` ON `GameReview` (`chipset`,`chipsetVariant`,`playMethod`,`performance`);--> statement-breakpoint
CREATE TABLE `Game` (
	`id` text PRIMARY KEY NOT NULL,
	`details` text,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`aggregatedPerformance` text,
	`reviewCount` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `Game_aggregatedPerformance_id_idx` ON `Game` (`aggregatedPerformance`,`id`);--> statement-breakpoint
CREATE INDEX `Game_reviewCount_idx` ON `Game` (`reviewCount`);--> statement-breakpoint
CREATE INDEX `Game_aggregatedPerformance_reviewCount_idx` ON `Game` (`aggregatedPerformance`,`reviewCount`);--> statement-breakpoint
CREATE TABLE `MacConfig` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`metadata` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `MacConfig_identifier_key` ON `MacConfig` (`identifier`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` text NOT NULL,
	`token` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_key` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`name` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`emailVerified` integer NOT NULL,
	`image` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_key` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` text NOT NULL,
	`createdAt` text,
	`updatedAt` text
);
