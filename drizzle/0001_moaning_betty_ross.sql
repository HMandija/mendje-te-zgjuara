CREATE TABLE `accounts` (
	`user` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `adventures` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`profile` text NOT NULL,
	`principal` text NOT NULL,
	`grade` integer NOT NULL,
	`payload` text NOT NULL,
	`expires` integer NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `adventures_expiry` ON `adventures` (`expires`);--> statement-breakpoint
CREATE TABLE `attempt_answers` (
	`adventure` text NOT NULL,
	`position` integer NOT NULL,
	`value` text NOT NULL,
	`payload` text NOT NULL,
	PRIMARY KEY(`adventure`, `position`),
	FOREIGN KEY (`adventure`) REFERENCES `adventures`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `puzzle_catalog` (
	`id` text PRIMARY KEY NOT NULL,
	`grade` integer NOT NULL,
	`category` text NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limits_expiry` ON `rate_limits` (`expires`);