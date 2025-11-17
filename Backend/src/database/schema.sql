-- =============================================
-- SCHEMA DE BASE DE DONNÉES EQUILIBRE
-- =============================================
-- Système de gestion avec 5 rôles utilisateurs
-- =============================================

-- Suppression des tables existantes (ordre inversé pour les dépendances)
DROP TABLE IF EXISTS requirements CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS class_members CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS requirement_status CASCADE;

-- =============================================
-- TYPE ENUM POUR LES RÔLES
-- =============================================
CREATE TYPE user_role AS ENUM (
    'ALTERNANT',              -- Étudiant en alternance
    'ETUDIANT_CLASSIQUE',     -- Étudiant en cycle classique
    'MAITRE_APP',             -- Maître d'apprentissage (entreprise)
    'TUTEUR_ECOLE',           -- Tuteur d'école
    'ADMIN'                   -- Administrateur de la plateforme
);

-- =============================================
-- TYPE ENUM POUR LE STATUT DES REQUIREMENTS
-- =============================================
CREATE TYPE requirement_status AS ENUM (
    'PENDING',        -- En attente de validation
    'APPROVED',       -- Approuvé
    'REJECTED'        -- Refusé
);

-- =============================================
-- TABLE: USERS
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    role user_role NOT NULL,

    -- Informations supplémentaires selon le rôle
    company VARCHAR(255),              -- Pour MAITRE_APP et ALTERNANT
    phone VARCHAR(20),
    profile_picture TEXT,

    -- OAuth Google
    google_id VARCHAR(255) UNIQUE,

    -- Dates
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false
);

-- =============================================
-- TABLE: CLASSES
-- =============================================
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    year VARCHAR(10) NOT NULL,              -- Ex: 2024-2025
    level VARCHAR(50),                      -- Ex: M1, M2, L3

    -- Tuteur responsable de la classe
    tuteur_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- =============================================
-- TABLE: CLASS_MEMBERS (Relation Many-to-Many)
-- =============================================
CREATE TABLE class_members (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Date d'ajout
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Contrainte d'unicité
    UNIQUE(class_id, user_id)
);

-- =============================================
-- TABLE: REQUIREMENTS (Exigences/Livrables)
-- =============================================
CREATE TABLE requirements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    -- Relation avec la classe
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,

    -- Créateur (typiquement ADMIN)
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Dates
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Status
    status requirement_status DEFAULT 'PENDING',

    -- Validation
    validated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMP,
    validation_comment TEXT
);

-- =============================================
-- TABLE: NOTIFICATIONS
-- =============================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',        -- info, warning, success, error

    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Lien optionnel vers une ressource
    link TEXT,
    metadata JSONB                          -- Données supplémentaires en JSON
);

-- =============================================
-- TABLE: MESSAGES (Système de messagerie)
-- =============================================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,

    -- Émetteur et destinataire
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    subject VARCHAR(255),
    content TEXT NOT NULL,

    -- Statut
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,

    -- Thread (pour les conversations)
    thread_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- =============================================

-- Index sur les emails pour les connexions
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Index sur les classes
CREATE INDEX idx_class_members_class ON class_members(class_id);
CREATE INDEX idx_class_members_user ON class_members(user_id);

-- Index sur les requirements
CREATE INDEX idx_requirements_class ON requirements(class_id);
CREATE INDEX idx_requirements_status ON requirements(status);
CREATE INDEX idx_requirements_created_by ON requirements(created_by);

-- Index sur les notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Index sur les messages
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);

-- =============================================
-- FONCTION TRIGGER: Mise à jour automatique updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application des triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DONNÉES DE TEST (Optionnel - à commenter en production)
-- =============================================

-- Mot de passe par défaut: "password123" (hashé avec bcrypt)
-- Hash généré: $2b$10$rKvVXZQJmH4Q4H4Q4H4Q4eZxKqYqYqYqYqYqYqYqYqYqYqYqYqYqY

-- Note: Pour créer un vrai hash bcrypt, utilisez:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('password123', 10);
