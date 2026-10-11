CREATE TABLE admin_challenges (hash TEXT PRIMARY KEY, user TEXT NOT NULL, expires INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0);
CREATE TABLE admin_sessions (hash TEXT PRIMARY KEY, user TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE access_events (id TEXT PRIMARY KEY, principal TEXT NOT NULL, kind TEXT NOT NULL, created INTEGER NOT NULL, ip TEXT NOT NULL, country TEXT NOT NULL);
CREATE INDEX access_events_created ON access_events(created);
CREATE TABLE traffic_days (day TEXT NOT NULL, path TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(day,path));
