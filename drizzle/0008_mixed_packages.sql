ALTER TABLE `assignments` ADD `mixed_number` integer;--> statement-breakpoint
ALTER TABLE `assignments` ADD `mixed_items` text;--> statement-breakpoint
CREATE UNIQUE INDEX `assignments_mixed_number` ON `assignments` (`class`,`mixed_number`) WHERE mixed_number IS NOT NULL;
