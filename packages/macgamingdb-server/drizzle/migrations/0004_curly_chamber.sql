CREATE TABLE `GameAlias` (
	`aliasId` text PRIMARY KEY NOT NULL,
	`canonicalId` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`canonicalId`) REFERENCES `Game`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `GameAlias_canonicalId_idx` ON `GameAlias` (`canonicalId`);--> statement-breakpoint
ALTER TABLE `Game` ADD `slug` text;--> statement-breakpoint
ALTER TABLE `Game` ADD `igdbId` integer;--> statement-breakpoint
ALTER TABLE `Game` ADD `source` text DEFAULT 'steam' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `Game_slug_key` ON `Game` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `Game_igdbId_key` ON `Game` (`igdbId`);