CREATE TABLE picture_login_guard (
  class TEXT NOT NULL,
  profile TEXT NOT NULL,
  failures INTEGER NOT NULL DEFAULT 0,
  retry_at INTEGER NOT NULL DEFAULT 0,
  locked INTEGER NOT NULL DEFAULT 0,
  attempt TEXT NOT NULL,
  accepted INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(class,profile),
  FOREIGN KEY(class,profile) REFERENCES class_students(class,profile) ON DELETE CASCADE
);
CREATE TRIGGER reset_picture_guard_updated AFTER UPDATE OF picture ON picture_logins
BEGIN
  DELETE FROM picture_login_guard WHERE class=NEW.class AND profile=NEW.profile;
END;
CREATE TRIGGER reset_picture_guard_inserted AFTER INSERT ON picture_logins
BEGIN
  DELETE FROM picture_login_guard WHERE class=NEW.class AND profile=NEW.profile;
END;
