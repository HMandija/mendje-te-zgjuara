CREATE TABLE student_sessions (
  hash TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  profile TEXT NOT NULL,
  expires INTEGER NOT NULL
);
CREATE INDEX student_sessions_owner_profile ON student_sessions(owner,profile);
CREATE INDEX student_sessions_expires ON student_sessions(expires);

CREATE TRIGGER revoke_changed_account_student_sessions AFTER UPDATE OF enabled,role ON accounts
WHEN NEW.enabled=0 OR NEW.role<>OLD.role
BEGIN
  DELETE FROM student_sessions WHERE owner=NEW.user;
END;
CREATE TRIGGER revoke_deleted_account_student_sessions AFTER DELETE ON accounts
BEGIN
  DELETE FROM student_sessions WHERE owner=OLD.user;
END;
