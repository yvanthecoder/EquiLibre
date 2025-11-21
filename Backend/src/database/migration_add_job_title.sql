-- Add job_title column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);

-- Add class_id column to users table (for ALTERNANT and ETUDIANT_CLASSIQUE)
ALTER TABLE users ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL;
