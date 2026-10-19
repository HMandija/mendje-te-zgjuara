ALTER TABLE assignments ADD COLUMN allowed_levels TEXT CHECK(allowed_levels IS NULL OR (json_valid(allowed_levels) AND json_type(allowed_levels)='array'));
