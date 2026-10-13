CREATE TABLE roster_imports (
 owner TEXT NOT NULL,
 request_id TEXT NOT NULL,
 class TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
 fingerprint TEXT NOT NULL,
 added INTEGER NOT NULL,
 PRIMARY KEY(owner,request_id)
);
CREATE INDEX roster_imports_class ON roster_imports(class);
