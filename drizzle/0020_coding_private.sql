ALTER TABLE coding_projects ADD COLUMN digest TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE coding_projects ADD COLUMN bytes INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE TABLE coding_objects(object_key TEXT PRIMARY KEY NOT NULL, created INTEGER NOT NULL);
--> statement-breakpoint
INSERT INTO coding_objects(object_key,created) SELECT object_key,updated FROM coding_projects;
--> statement-breakpoint
CREATE TRIGGER coding_member_removed AFTER DELETE ON class_students BEGIN
 DELETE FROM coding_projects WHERE profile=OLD.profile AND owner=(SELECT owner FROM classes WHERE id=OLD.class)
 AND NOT EXISTS(SELECT 1 FROM class_students s JOIN classes c ON c.id=s.class WHERE c.owner=coding_projects.owner AND s.profile=OLD.profile AND c.grade=5);
END;
--> statement-breakpoint
CREATE TRIGGER coding_class_removed BEFORE DELETE ON classes BEGIN
 DELETE FROM coding_projects WHERE owner=OLD.owner AND profile IN(SELECT profile FROM class_students WHERE class=OLD.id)
 AND NOT EXISTS(SELECT 1 FROM class_students s JOIN classes c ON c.id=s.class WHERE c.owner=OLD.owner AND s.profile=coding_projects.profile AND c.grade=5 AND c.id<>OLD.id);
END;
--> statement-breakpoint
CREATE TRIGGER coding_profile_removed AFTER UPDATE OF payload ON workspaces BEGIN
 DELETE FROM coding_projects WHERE owner=NEW.owner AND NOT EXISTS(SELECT 1 FROM json_each(NEW.payload,'$.profiles') p WHERE json_extract(p.value,'$.id')=coding_projects.profile AND json_extract(p.value,'$.grade')=5);
END;
--> statement-breakpoint
CREATE TRIGGER coding_workspace_removed AFTER DELETE ON workspaces BEGIN
 DELETE FROM coding_projects WHERE owner=OLD.owner;
END;
