-- =============================================
-- SCHEMA POSTGRES - EQUILIBRE
-- =============================================

-- Nettoyage
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS requirements CASCADE;
DROP TABLE IF EXISTS class_members CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS requirement_status CASCADE;

-- ENUM ROLES
CREATE TYPE user_role AS ENUM (
    'ALTERNANT',
    'ETUDIANT_CLASSIQUE',
    'MAITRE_APP',
    'TUTEUR_ECOLE',
    'ADMIN'
);

-- ENUM STATUT REQUIREMENTS
CREATE TYPE requirement_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

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
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status requirement_status DEFAULT 'PENDING',
    validated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMP,
    validation_comment TEXT
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    link TEXT,
    metadata JSONB
);

-- MESSAGES
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    thread_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
