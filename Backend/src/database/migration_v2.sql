-- =============================================
-- MIGRATION V2 - AJOUT DES CHAMPS MANQUANTS
-- =============================================
-- Date: 16 novembre 2025
-- Description: Ajout des champs pour inscription complète et gestion des assignations
-- =============================================

-- Ajouter les nouveaux champs à la table users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS job_title VARCHAR(255),           -- Poste/fonction dans l'entreprise
ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id);  -- Classe de l'étudiant

-- Créer une table pour les assignations (étudiant <-> maître <-> tuteur)
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,

    -- Étudiant concerné
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Maître d'apprentissage assigné (peut être NULL si étudiant classique)
    maitre_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Tuteur d'école assigné (obligatoire pour tous les étudiants)
    tuteur_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Dates
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Contraintes
    CONSTRAINT unique_student_assignment UNIQUE(student_id),
    CONSTRAINT check_student_role CHECK (student_id IN (
        SELECT id FROM users WHERE role IN ('ALTERNANT', 'ETUDIANT_CLASSIQUE')
    ))
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_maitre ON assignments(maitre_id);
CREATE INDEX IF NOT EXISTS idx_assignments_tuteur ON assignments(tuteur_id);
CREATE INDEX IF NOT EXISTS idx_users_class ON users(class_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Ajouter un champ pour suivre le nombre d'étudiants par tuteur
-- (un tuteur peut avoir max 2 étudiants)
CREATE OR REPLACE FUNCTION check_tuteur_limit()
RETURNS TRIGGER AS $$
DECLARE
    student_count INTEGER;
BEGIN
    IF NEW.tuteur_id IS NOT NULL THEN
        SELECT COUNT(*) INTO student_count
        FROM assignments
        WHERE tuteur_id = NEW.tuteur_id;

        IF student_count >= 2 THEN
            RAISE EXCEPTION 'Un tuteur ne peut avoir plus de 2 étudiants assignés';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS check_tuteur_limit_trigger ON assignments;
CREATE TRIGGER check_tuteur_limit_trigger
    BEFORE INSERT OR UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION check_tuteur_limit();

-- Commentaires pour documentation
COMMENT ON TABLE assignments IS 'Table des assignations étudiants <-> maîtres <-> tuteurs';
COMMENT ON COLUMN users.job_title IS 'Poste occupé dans l''entreprise (ALTERNANT, MAITRE_APP)';
COMMENT ON COLUMN users.class_id IS 'Classe de l''étudiant (ALTERNANT, ETUDIANT_CLASSIQUE)';

-- Afficher un message de succès
DO $$
BEGIN
    RAISE NOTICE '  Migration V2 appliquée avec succès!';
END $$;
