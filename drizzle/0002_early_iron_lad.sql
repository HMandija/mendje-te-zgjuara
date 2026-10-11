CREATE INDEX `invitations_owner_profile` ON `invitations` (`owner`,`profile`);--> statement-breakpoint
CREATE INDEX `sessions_owner_profile_created` ON `sessions` (`owner`,`profile`,`created`);