-- ============================================
--   Base de données : equilibre_db
--   Projet : EquiLibre (Apprentissage)
-- ============================================

CREATE DATABASE IF NOT EXISTS equilibre_db;
USE equilibre_db;

-- ============================
-- TABLE : Utilisateur
-- ============================
CREATE TABLE utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    mot_de_passe VARCHAR(255)
);

-- ============================
-- TABLE : Promotion
-- ============================
CREATE TABLE promotion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    annee VARCHAR(20),
    nom VARCHAR(100)
);

-- ============================
-- TABLE : Apprenti
-- ============================
CREATE TABLE apprenti (
    id INT PRIMARY KEY,
    promotion_id INT,
    FOREIGN KEY (id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (promotion_id) REFERENCES promotion(id)
);

-- ============================
-- TABLE : Entreprise
-- ============================
CREATE TABLE entreprise (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150),
    adresse VARCHAR(255),
    siret VARCHAR(20)
);

-- ============================
-- TABLE : Maître d’Apprentissage
-- ============================
CREATE TABLE maitre_apprentissage (
    id INT PRIMARY KEY,
    entreprise_id INT,
    FOREIGN KEY (id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (entreprise_id) REFERENCES entreprise(id)
);

-- ============================
-- TABLE : Tuteur Pédagogique
-- ============================
CREATE TABLE tuteur_pedagogique (
    id INT PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- ============================
-- TABLE : Journal de Formation
-- ============================
CREATE TABLE journal_formation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apprenti_id INT,
    date_creation DATE,
    FOREIGN KEY (apprenti_id) REFERENCES apprenti(id) ON DELETE CASCADE
);

-- ============================
-- TABLE : Activité du Journal
-- ============================
CREATE TABLE activite (
    id INT AUTO_INCREMENT PRIMARY KEY,
    journal_id INT,
    description TEXT,
    date_realisation DATE,
    FOREIGN KEY (journal_id) REFERENCES journal_formation(id) ON DELETE CASCADE
);

-- ============================
-- TABLE : Note Mensuelle
-- ============================
CREATE TABLE note_mensuelle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apprenti_id INT,
    mois VARCHAR(20),
    annee INT,
    note FLOAT,
    commentaires TEXT,
    date_depot DATE,
    FOREIGN KEY (apprenti_id) REFERENCES apprenti(id) ON DELETE CASCADE
);

-- ============================
-- TABLE : Fiche Synthèse
-- ============================
CREATE TABLE fiche_synthese (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apprenti_id INT,
    semestre VARCHAR(20),
    contenu TEXT,
    date_depot DATE,
    FOREIGN KEY (apprenti_id) REFERENCES apprenti(id) ON DELETE CASCADE
);

-- ============================
-- TABLE : Rapport
-- ============================
CREATE TABLE rapport (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apprenti_id INT,
    type VARCHAR(50),
    semestre VARCHAR(20),
    date_depot DATE,
    fichier VARCHAR(255),
    FOREIGN KEY (apprenti_id) REFERENCES apprenti(id) ON DELETE CASCADE
);

-- ============================
-- TABLE : Slide Présentation
-- ============================
CREATE TABLE slide_presentation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apprenti_id INT,
    type VARCHAR(50),
    semestre VARCHAR(20),
    date_depot DATE,
    fichier VARCHAR(255),
    FOREIGN KEY (apprenti_id) REFERENCES apprenti(id) ON DELETE CASCADE
);

-- ============================
-- TABLE : Jury
-- ============================
CREATE TABLE jury (
    id INT AUTO_INCREMENT PRIMARY KEY
);

-- ============================
-- TABLE pivot : Membres du Jury
-- ============================
CREATE TABLE jury_membre (
    jury_id INT,
    utilisateur_id INT,
    PRIMARY KEY (jury_id, utilisateur_id),
    FOREIGN KEY (jury_id) REFERENCES jury(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- ============================
-- TABLE : Soutenance
-- ============================
CREATE TABLE soutenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_soutenance DATE,
    heure TIME,
    lieu VARCHAR(255),
    jury_id INT,
    apprenti_id INT,
    FOREIGN KEY (jury_id) REFERENCES jury(id) ON DELETE SET NULL,
    FOREIGN KEY (apprenti_id) REFERENCES apprenti(id) ON DELETE CASCADE
);

-- ============================
-- TABLE : Entretien Semestriel
-- ============================
CREATE TABLE entretien_semestriel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_entretien DATE,
    compte_rendu TEXT,
    apprenti_id INT,
    FOREIGN KEY (apprenti_id) REFERENCES apprenti(id) ON DELETE CASCADE
);

-- FIN DU SCRIPT
