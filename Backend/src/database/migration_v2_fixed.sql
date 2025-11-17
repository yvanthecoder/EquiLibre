-- =============================================
-- MIGRATION V2 - VERSION CORRIGÉE
-- =============================================

-- 1. Ajouter les nouveaux champs à la table users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS job_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS class_id INTEGER;

-- 2. Créer la table assignments (sans contrainte problématique)
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    maitre_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    tuteur_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_assignment UNIQUE(student_id)
);

-- 3. Ajouter la foreign key vers classes après la création de la table
ALTER TABLE users
ADD CONSTRAINT fk_users_class
FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;

-- 4. Créer les index
CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_maitre ON assignments(maitre_id);
CREATE INDEX IF NOT EXISTS idx_assignments_tuteur ON assignments(tuteur_id);
CREATE INDEX IF NOT EXISTS idx_users_class ON users(class_id);

-- 5. Fonction pour limiter le nombre d'étudiants par tuteur
CREATE OR REPLACE FUNCTION check_tuteur_limit()
RETURNS TRIGGER AS $$
DECLARE
    student_count INTEGER;
BEGIN
    IF NEW.tuteur_id IS NOT NULL THEN
        SELECT COUNT(*) INTO student_count
        FROM assignments
        WHERE tuteur_id = NEW.tuteur_id
          AND id != COALESCE(NEW.id, 0);

        IF student_count >= 2 THEN
            RAISE EXCEPTION 'Un tuteur ne peut avoir plus de 2 étudiants assignés';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Appliquer le trigger
DROP TRIGGER IF EXISTS check_tuteur_limit_trigger ON assignments;
CREATE TRIGGER check_tuteur_limit_trigger
    BEFORE INSERT OR UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION check_tuteur_limit();

-- 7. Commentaires
COMMENT ON TABLE assignments IS 'Assignations étudiants <-> maîtres <-> tuteurs';
COMMENT ON COLUMN users.job_title IS 'Poste dans l''entreprise';
COMMENT ON COLUMN users.class_id IS 'Classe de l''étudiant';

SELECT '  Migration V2 appliquée avec succès!' AS status;
