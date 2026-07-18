ALTER TABLE `GameReview` ADD `reportCount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `GameReview` ADD `lastReportedAt` text;--> statement-breakpoint
ALTER TABLE `GameReview` ADD `hiddenAt` text;