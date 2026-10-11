CREATE TABLE `classroom_settings` (
	`class` text PRIMARY KEY NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`class`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `picture_logins` (
	`class` text NOT NULL,
	`profile` text NOT NULL,
	`picture` text NOT NULL,
	PRIMARY KEY(`class`, `profile`),
	FOREIGN KEY (`class`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `picture_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`class` text NOT NULL,
	`profile` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`class`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `picture_sessions_class_profile` ON `picture_sessions` (`class`,`profile`);--> statement-breakpoint
CREATE TABLE `roster_challenges` (
	`hash` text PRIMARY KEY NOT NULL,
	`class` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`class`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE cascade
);
