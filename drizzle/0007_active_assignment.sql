ALTER TABLE `assignments` ADD `active` integer NOT NULL DEFAULT 1;--> statement-breakpoint
UPDATE assignments SET active=0 WHERE rowid NOT IN (SELECT MAX(rowid) FROM assignments GROUP BY class);--> statement-breakpoint
CREATE UNIQUE INDEX assignments_one_active ON assignments(class) WHERE active=1;
