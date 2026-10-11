CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`class` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`level` integer NOT NULL,
	`count` integer NOT NULL,
	`due` text NOT NULL,
	FOREIGN KEY (`class`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `assignments_class` ON `assignments` (`class`);--> statement-breakpoint
CREATE TABLE `class_students` (
	`class` text NOT NULL,
	`profile` text NOT NULL,
	PRIMARY KEY(`class`, `profile`),
	FOREIGN KEY (`class`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` text PRIMARY KEY NOT NULL,
	`school` text NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`grade` integer NOT NULL,
	`code` text NOT NULL,
	FOREIGN KEY (`school`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `classes_code_unique` ON `classes` (`code`);--> statement-breakpoint
CREATE INDEX `classes_owner` ON `classes` (`owner`);--> statement-breakpoint
CREATE TABLE `memberships` (
	`school` text NOT NULL,
	`user` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`school`, `user`),
	FOREIGN KEY (`school`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `schools_owner_unique` ON `schools` (`owner`);--> statement-breakpoint
ALTER TABLE `adventures` ADD `level` integer;--> statement-breakpoint
ALTER TABLE `adventures` ADD `assignment` text;--> statement-breakpoint
ALTER TABLE `adventures` ADD `started` integer;