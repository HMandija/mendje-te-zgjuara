-- Directory values come from server-verified Supabase responses, never browser input.
CREATE TABLE account_contacts (
 user TEXT PRIMARY KEY,
 email TEXT NOT NULL,
 updated INTEGER NOT NULL
);
INSERT OR IGNORE INTO account_contacts(user,email,updated)
 SELECT 'supabase:'||user,email,0 FROM admin_sessions WHERE email<>'';
CREATE TABLE admin_account_actions (
 id TEXT PRIMARY KEY,
 actor TEXT NOT NULL,
 target TEXT NOT NULL,
 action TEXT NOT NULL CHECK(action IN ('create','block','unblock')),
 created INTEGER NOT NULL
);
CREATE INDEX admin_account_actions_target ON admin_account_actions(target,created);
