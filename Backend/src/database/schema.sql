-- =============================================
-- SCHEMA POSTGRES - EQUILIBRE
-- =============================================

-- Nettoyage
DROP TABLE IF EXISTS requirement_submissions CASCADE;
DROP TABLE IF EXISTS evaluation_scores CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS evaluation_criteria CASCADE;
DROP TABLE IF EXISTS evaluation_grids CASCADE;
DROP TABLE IF EXISTS soutenance_jury CASCADE;
DROP TABLE IF EXISTS soutenances CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS journals CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS requirements CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS class_members CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS evaluation_context CASCADE;
DROP TYPE IF EXISTS journal_status CASCADE;
DROP TYPE IF EXISTS interview_status CASCADE;
DROP TYPE IF EXISTS soutenance_status CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS requirement_status CASCADE;

-- ENUM ROLES
CREATE TYPE user_role AS ENUM (
    'ALTERNANT',
    'ETUDIANT_CLASSIQUE',
    'MAITRE_APP',
    'TUTEUR_ECOLE',
    'ADMIN',
    'JURY',
    'INTERVENANT'
);

-- ENUM STATUT REQUIREMENTS
CREATE TYPE requirement_status AS ENUM ('PENDING', 'SUBMITTED', 'VALIDATED', 'REJECTED', 'LOCKED');

-- ENUM STATUT SOUMISSIONS
CREATE TYPE submission_status AS ENUM ('SUBMITTED', 'VALIDATED', 'REJECTED');

-- ENUM STATUT JOURNAL
CREATE TYPE journal_status AS ENUM ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'VALIDATED', 'ARCHIVED');

-- ENUM STATUT ENTRETIEN
CREATE TYPE interview_status AS ENUM ('PROPOSED', 'PLANNED', 'CONFIRMED', 'COMPLETED', 'ARCHIVED');

-- ENUM STATUT SOUTENANCE
CREATE TYPE soutenance_status AS ENUM ('PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'EVALUATED', 'ARCHIVED');

-- ENUM CONTEXTE EVALUATION
CREATE TYPE evaluation_context AS ENUM ('JOURNAL', 'REQUIREMENT', 'SOUTENANCE');

-- ENUM TYPE EVENEMENTS
CREATE TYPE event_type AS ENUM ('COURSE', 'EXAM', 'DEADLINE', 'MEETING');

-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(20),
    job_title VARCHAR(255),
    profile_picture TEXT,
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false
);

-- CLASSES
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    year VARCHAR(10) NOT NULL,
    level VARCHAR(50),
    tuteur_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Ajouter la classe principale sur l'utilisateur (fait aprA"s la crAcation des classes pour Acviter la rAcfAcrence circulaire)
ALTER TABLE users
    ADD COLUMN class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL;

-- CLASS MEMBERS
CREATE TABLE class_members (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_id, user_id)
);

-- REQUIREMENTS
CREATE TABLE requirements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status requirement_status DEFAULT 'PENDING',
    validated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMP,
    validation_comment TEXT
);

-- SOUMISSIONS DES REQUIREMENTS
CREATE TABLE requirement_submissions (
    id SERIAL PRIMARY KEY,
    requirement_id INTEGER NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(255),
    status submission_status DEFAULT 'SUBMITTED',
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- JOURNAUX DE FORMATION
CREATE TABLE journals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start DATE,
    period_end DATE,
    status journal_status DEFAULT 'DRAFT',
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMP,
    validation_comment TEXT
);

-- ENTRETIENS SEMESTRIELS
CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tuteur_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    maitre_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP NOT NULL,
    location TEXT,
    status interview_status DEFAULT 'PLANNED',
    summary TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SOUTENANCES
CREATE TABLE soutenances (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    location TEXT,
    status soutenance_status DEFAULT 'PLANNED',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- JURY DE SOUTENANCE
CREATE TABLE soutenance_jury (
    id SERIAL PRIMARY KEY,
    soutenance_id INTEGER NOT NULL REFERENCES soutenances(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (soutenance_id, user_id)
);

-- GRILLES D'EVALUATION
CREATE TABLE evaluation_grids (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluation_criteria (
    id SERIAL PRIMARY KEY,
    grid_id INTEGER NOT NULL REFERENCES evaluation_grids(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL DEFAULT 20,
    weight NUMERIC(5,2) NOT NULL DEFAULT 1
);

-- EVALUATIONS
CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context_type evaluation_context NOT NULL,
    context_id INTEGER NOT NULL,
    grid_id INTEGER REFERENCES evaluation_grids(id) ON DELETE SET NULL,
    overall_score NUMERIC(5,2),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluation_scores (
    id SERIAL PRIMARY KEY,
    evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    criteria_id INTEGER NOT NULL REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    comment TEXT
);

-- EVENEMENTS DE CLASSE
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    type event_type NOT NULL DEFAULT 'COURSE',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ASSIGNATIONS (Actudiant <-> maArtre / tuteur)
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    maitre_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    tuteur_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id)
);

-- Historique des assignations
CREATE TABLE assignment_logs (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_maitre_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    new_maitre_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    old_tuteur_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    new_tuteur_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- CREATED / UPDATED / DELETED
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    link TEXT,
    metadata JSONB
);

-- FICHIERS (perso ou classe)
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,          -- nom original
    stored_name TEXT NOT NULL,        -- nom stoquAc pour le disque
    file_path TEXT NOT NULL,          -- chemin complet ou relatif
    file_size INTEGER,
    mime_type VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visibility_role VARCHAR(50),      -- partage par rA"le
    requires_signature BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    parent_file_id INTEGER REFERENCES files(id) ON DELETE SET NULL
);

CREATE TABLE file_signatures (
    id SERIAL PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (file_id, user_id)
);

-- CONVERSATIONS (messagerie)
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PARTICIPANTS D'UNE CONVERSATION
CREATE TABLE conversation_participants (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (conversation_id, user_id)
);

-- MESSAGES (liAc A� une conversation)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TRIGGER updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirement_submissions_updated_at BEFORE UPDATE ON requirement_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON journals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_soutenances_updated_at BEFORE UPDATE ON soutenances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_grids_updated_at BEFORE UPDATE ON evaluation_grids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
