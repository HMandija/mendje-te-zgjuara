-- Keep only hashes of credentials. Existing teacher cookies must sign in again.
CREATE TABLE teacher_sessions (hash TEXT PRIMARY KEY, user TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE INDEX teacher_sessions_expires ON teacher_sessions(expires);
CREATE INDEX teacher_sessions_user ON teacher_sessions(user);
ALTER TABLE admin_sessions ADD COLUMN email TEXT NOT NULL DEFAULT '';
ALTER TABLE admin_sessions ADD COLUMN provider_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE admin_challenges ADD COLUMN email TEXT NOT NULL DEFAULT '';

-- Disabled/changed accounts cannot regain old sessions when enabled again.
CREATE TRIGGER revoke_changed_account_sessions AFTER UPDATE OF enabled,role ON accounts
WHEN NEW.enabled=0 OR NEW.role<>OLD.role
BEGIN
  DELETE FROM teacher_sessions WHERE user=NEW.user;
  DELETE FROM admin_sessions WHERE 'supabase:'||user=NEW.user;
  DELETE FROM admin_challenges WHERE 'supabase:'||user=NEW.user;
  DELETE FROM picture_sessions WHERE class IN (SELECT id FROM classes WHERE owner=NEW.user);
  UPDATE invitations SET revoked=1 WHERE owner=NEW.user;
END;
CREATE TRIGGER revoke_deleted_account_sessions AFTER DELETE ON accounts
BEGIN
  DELETE FROM teacher_sessions WHERE user=OLD.user;
  DELETE FROM admin_sessions WHERE 'supabase:'||user=OLD.user;
  DELETE FROM admin_challenges WHERE 'supabase:'||user=OLD.user;
  DELETE FROM picture_sessions WHERE class IN (SELECT id FROM classes WHERE owner=OLD.user);
  UPDATE invitations SET revoked=1 WHERE owner=OLD.user;
END;
