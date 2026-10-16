CREATE TABLE IF NOT EXISTS robot_worlds (
 owner TEXT NOT NULL, profile TEXT NOT NULL, payload TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 0, last_event TEXT NOT NULL DEFAULT '',
 updated INTEGER NOT NULL, PRIMARY KEY (owner,profile)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS robot_world_events (
 owner TEXT NOT NULL, profile TEXT NOT NULL, id TEXT NOT NULL,
 created INTEGER NOT NULL, PRIMARY KEY (owner,profile,id),
 FOREIGN KEY (owner,profile) REFERENCES robot_worlds(owner,profile) ON DELETE CASCADE
);
