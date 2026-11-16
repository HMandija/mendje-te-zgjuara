CREATE TABLE `coding_assignments` (
 `class` TEXT NOT NULL REFERENCES `classes`(`id`) ON DELETE CASCADE,
 `mission` TEXT NOT NULL,
 `created` INTEGER NOT NULL,
 PRIMARY KEY (`class`, `mission`)
);
--> statement-breakpoint
CREATE TABLE `coding_projects` (
 `owner` TEXT NOT NULL,
 `profile` TEXT NOT NULL,
 `mission` TEXT NOT NULL,
 `object_key` TEXT NOT NULL,
 `revision` INTEGER NOT NULL,
 `updated` INTEGER NOT NULL,
 PRIMARY KEY (`owner`, `profile`, `mission`)
);
