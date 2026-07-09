CREATE TABLE `GameSourceLink` (
	`gameId` text NOT NULL,
	`source` text NOT NULL,
	`externalId` text NOT NULL,
	`createdAt` text NOT NULL,
	PRIMARY KEY(`source`, `externalId`),
	FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `GameSourceLink_gameId_idx` ON `GameSourceLink` (`gameId`);--> statement-breakpoint
ALTER TABLE `Game` ADD `name` text;--> statement-breakpoint
ALTER TABLE `Game` ADD `headerImage` text;--> statement-breakpoint
ALTER TABLE `Game` ADD `descriptionHtml` text;--> statement-breakpoint
ALTER TABLE `Game` ADD `website` text;--> statement-breakpoint
ALTER TABLE `Game` ADD `releaseDate` text;--> statement-breakpoint
ALTER TABLE `Game` ADD `releaseYear` integer;--> statement-breakpoint
ALTER TABLE `Game` ADD `developers` text;--> statement-breakpoint
ALTER TABLE `Game` ADD `publishers` text;--> statement-breakpoint
ALTER TABLE `Game` ADD `genres` text;--> statement-breakpoint
ALTER TABLE `Game` ADD `screenshots` text;