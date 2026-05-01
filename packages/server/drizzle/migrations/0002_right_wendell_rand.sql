CREATE TABLE `UserExternalAccount` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`provider` text NOT NULL,
	`externalUserId` text NOT NULL,
	`metadata` text,
	`lastSyncedAt` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `UserExternalAccount_userId_provider_key` ON `UserExternalAccount` (`userId`,`provider`);--> statement-breakpoint
CREATE INDEX `UserExternalAccount_provider_externalUserId_idx` ON `UserExternalAccount` (`provider`,`externalUserId`);--> statement-breakpoint
CREATE TABLE `UserLibraryEntry` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`provider` text NOT NULL,
	`externalGameId` text NOT NULL,
	`gameId` text,
	`playtimeMinutes` integer DEFAULT 0 NOT NULL,
	`lastSyncedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `UserLibraryEntry_userId_provider_externalGameId_key` ON `UserLibraryEntry` (`userId`,`provider`,`externalGameId`);--> statement-breakpoint
CREATE INDEX `UserLibraryEntry_userId_provider_idx` ON `UserLibraryEntry` (`userId`,`provider`);--> statement-breakpoint
CREATE INDEX `UserLibraryEntry_gameId_idx` ON `UserLibraryEntry` (`gameId`);