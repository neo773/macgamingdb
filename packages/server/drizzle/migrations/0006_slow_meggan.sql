UPDATE `Game` SET
	`name` = json_extract(`details`, '$.name'),
	`headerImage` = json_extract(`details`, '$.header_image'),
	`descriptionHtml` = json_extract(`details`, '$.detailed_description'),
	`website` = json_extract(`details`, '$.website'),
	`releaseDate` = json_extract(`details`, '$.release_date.date'),
	`releaseYear` = CASE
		WHEN json_extract(`details`, '$.release_date.date') GLOB '*[12][09][0-9][0-9]'
		THEN CAST(substr(json_extract(`details`, '$.release_date.date'), -4) AS INTEGER)
		ELSE NULL
	END,
	`developers` = json_extract(`details`, '$.developers'),
	`publishers` = json_extract(`details`, '$.publishers'),
	`genres` = (
		SELECT json_group_array(json_extract(`value`, '$.description'))
		FROM json_each(json_extract(`Game`.`details`, '$.genres'))
	),
	`screenshots` = (
		SELECT json_group_array(json_extract(`value`, '$.path_full'))
		FROM json_each(json_extract(`Game`.`details`, '$.screenshots'))
	)
WHERE `source` = 'steam' AND `details` IS NOT NULL AND `name` IS NULL;--> statement-breakpoint
INSERT OR IGNORE INTO `GameSourceLink` (`source`, `externalId`, `gameId`, `createdAt`)
	SELECT 'steam', `id`, `id`, `createdAt` FROM `Game` WHERE `source` = 'steam';--> statement-breakpoint
INSERT OR IGNORE INTO `GameSourceLink` (`source`, `externalId`, `gameId`, `createdAt`)
	SELECT 'igdb', CAST(`igdbId` AS TEXT), `id`, `createdAt` FROM `Game` WHERE `igdbId` IS NOT NULL;--> statement-breakpoint
DROP INDEX `Game_igdbId_key`;--> statement-breakpoint
ALTER TABLE `Game` DROP COLUMN `igdbId`;--> statement-breakpoint
ALTER TABLE `Game` DROP COLUMN `source`;--> statement-breakpoint
ALTER TABLE `Game` DROP COLUMN `details`;