ALTER TABLE assignments ADD COLUMN source_grade INTEGER CHECK(source_grade BETWEEN 1 AND 4);
