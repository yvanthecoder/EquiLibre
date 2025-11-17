-- =============================================
-- DONNÉES DE TEST POUR EQUILIBRE
-- =============================================
-- Mot de passe pour tous: "password123"
-- Hash bcrypt: $2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka
-- =============================================

-- Nettoyage des données existantes
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE requirements CASCADE;
TRUNCATE TABLE class_members CASCADE;
TRUNCATE TABLE classes CASCADE;
TRUNCATE TABLE users CASCADE;

-- Redémarrer les séquences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE classes_id_seq RESTART WITH 1;
ALTER SEQUENCE class_members_id_seq RESTART WITH 1;
ALTER SEQUENCE requirements_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;

-- =============================================
-- INSERTION DES UTILISATEURS
-- =============================================

-- 1. ADMINISTRATEUR
INSERT INTO users (email, password, firstname, lastname, role, is_verified) VALUES
('admin@equilibre.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Admin', 'Plateforme', 'ADMIN', true);

-- 2. TUTEURS D'ÉCOLE
INSERT INTO users (email, password, firstname, lastname, role, phone, is_verified) VALUES
('tuteur1@equilibre.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Marie', 'Dupont', 'TUTEUR_ECOLE', '0601020304', true),
('tuteur2@equilibre.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Pierre', 'Martin', 'TUTEUR_ECOLE', '0602030405', true);

-- 3. MAÎTRES D'APPRENTISSAGE
INSERT INTO users (email, password, firstname, lastname, role, company, phone, is_verified) VALUES
('maitre1@entreprise.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Jean', 'Dubois', 'MAITRE_APP', 'Tech Corp', '0603040506', true),
('maitre2@entreprise.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Sophie', 'Bernard', 'MAITRE_APP', 'Innovation SA', '0604050607', true);

-- 4. ALTERNANTS
INSERT INTO users (email, password, firstname, lastname, role, company, is_verified) VALUES
('alternant1@student.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Lucas', 'Petit', 'ALTERNANT', 'Tech Corp', true),
('alternant2@student.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Emma', 'Roux', 'ALTERNANT', 'Innovation SA', true);

-- 5. ÉTUDIANTS CLASSIQUES
INSERT INTO users (email, password, firstname, lastname, role, is_verified) VALUES
('etudiant1@student.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Julie', 'Moreau', 'ETUDIANT_CLASSIQUE', true),
('etudiant2@student.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Thomas', 'Simon', 'ETUDIANT_CLASSIQUE', true);

-- =============================================
-- CRÉATION DES CLASSES
-- =============================================

INSERT INTO classes (name, description, year, level, tuteur_id) VALUES
('Master 1 SIGL - Groupe A', 'Première année du Master SIGL - Groupe A', '2024-2025', 'M1', 2),
('Master 2 SIGL - Groupe B', 'Deuxième année du Master SIGL - Groupe B', '2024-2025', 'M2', 3);

-- =============================================
-- INSCRIPTION DES MEMBRES AUX CLASSES
-- =============================================

-- Classe 1 (M1 SIGL - Groupe A)
INSERT INTO class_members (class_id, user_id) VALUES
(1, 6), -- Lucas (alternant)
(1, 8); -- Julie (étudiante classique)

-- Classe 2 (M2 SIGL - Groupe B)
INSERT INTO class_members (class_id, user_id) VALUES
(2, 7), -- Emma (alternante)
(2, 9); -- Thomas (étudiant classique)

-- =============================================
-- CRÉATION DE REQUIREMENTS
-- =============================================

INSERT INTO requirements (title, description, class_id, created_by, deadline, status) VALUES
('Rapport de stage - Trimestre 1', 'Rédiger et soumettre le rapport de stage du premier trimestre', 1, 1, CURRENT_TIMESTAMP + INTERVAL '30 days', 'PENDING'),
('Présentation projet final', 'Préparer la présentation du projet de fin d''année', 2, 1, CURRENT_TIMESTAMP + INTERVAL '60 days', 'PENDING'),
('Feuille de temps Septembre', 'Soumettre la feuille de temps du mois de septembre', 1, 1, CURRENT_TIMESTAMP + INTERVAL '7 days', 'APPROVED');

-- =============================================
-- CRÉATION DE NOTIFICATIONS
-- =============================================

INSERT INTO notifications (user_id, title, message, type) VALUES
(6, 'Nouveau requirement', 'Un nouveau requirement a été ajouté à votre classe', 'info'),
(7, 'Deadline approchante', 'Le rapport de stage est à rendre dans 7 jours', 'warning'),
(8, 'Bienvenue', 'Bienvenue sur la plateforme EquiLibre!', 'success');

-- =============================================
-- CRÉATION DE MESSAGES
-- =============================================

INSERT INTO messages (sender_id, receiver_id, subject, content) VALUES
(2, 6, 'Suivi de stage', 'Bonjour Lucas, pouvez-vous me faire un point sur l''avancement de votre stage ?'),
(6, 2, 'RE: Suivi de stage', 'Bonjour Madame Dupont, mon stage se passe très bien. Je travaille actuellement sur...'),
(1, 2, 'Réunion pédagogique', 'Réunion prévue mardi prochain à 14h pour discuter des évaluations.');

-- =============================================
-- AFFICHAGE DES DONNÉES CRÉÉES
-- =============================================

SELECT 'USERS CREATED:' as info;
SELECT id, email, firstname, lastname, role FROM users ORDER BY id;

SELECT 'CLASSES CREATED:' as info;
SELECT id, name, year, level FROM classes ORDER BY id;

SELECT 'REQUIREMENTS CREATED:' as info;
SELECT id, title, deadline, status FROM requirements ORDER BY id;
