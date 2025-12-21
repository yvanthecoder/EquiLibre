-- RESET COMPLET POUR LES DONNAA?ES DE DEMO
TRUNCATE TABLE requirement_submissions CASCADE;
TRUNCATE TABLE files CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE conversation_participants CASCADE;
TRUNCATE TABLE conversations CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE requirements CASCADE;
TRUNCATE TABLE assignments CASCADE;
TRUNCATE TABLE class_members CASCADE;
TRUNCATE TABLE events CASCADE;
TRUNCATE TABLE classes CASCADE;
TRUNCATE TABLE users CASCADE;

ALTER SEQUENCE requirement_submissions_id_seq RESTART WITH 1;
ALTER SEQUENCE files_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;
ALTER SEQUENCE conversation_participants_id_seq RESTART WITH 1;
ALTER SEQUENCE conversations_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE requirements_id_seq RESTART WITH 1;
ALTER SEQUENCE assignments_id_seq RESTART WITH 1;
ALTER SEQUENCE class_members_id_seq RESTART WITH 1;
ALTER SEQUENCE events_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE classes_id_seq RESTART WITH 1;

-- ADMIN
INSERT INTO users (email, password, firstname, lastname, role, is_verified, job_title)
VALUES ('admin@equilibre.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Admin', 'Plateforme', 'ADMIN', true, 'Responsable plateforme');

-- TUTEURS
INSERT INTO users (email, password, firstname, lastname, role, phone, is_verified, job_title) VALUES
('tuteur1@equilibre.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Marie', 'Dupont', 'TUTEUR_ECOLE', '0601020304', true, 'Tuteur universitaire'),
('tuteur2@equilibre.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Pierre', 'Martin', 'TUTEUR_ECOLE', '0602030405', true, 'Tuteur universitaire');

-- MAITRES
INSERT INTO users (email, password, firstname, lastname, role, company, phone, is_verified, job_title) VALUES
('maitre1@entreprise.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Jean', 'Dubois', 'MAITRE_APP', 'Tech Corp', '0603040506', true, 'Responsable pAcdagogique'),
('maitre2@entreprise.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Sophie', 'Bernard', 'MAITRE_APP', 'Innovation SA', '0604050607', true, 'Manager');

-- ALTERNANTS
INSERT INTO users (email, password, firstname, lastname, role, company, is_verified, job_title) VALUES
('alternant1@student.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Lucas', 'Petit', 'ALTERNANT', 'Tech Corp', true, 'Developpeur junior'),
('alternant2@student.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Emma', 'Roux', 'ALTERNANT', 'Innovation SA', true, 'Product analyst');

-- A%TUDIANTS CLASSIQUES
INSERT INTO users (email, password, firstname, lastname, role, is_verified, job_title) VALUES
('etudiant1@student.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Julie', 'Moreau', 'ETUDIANT_CLASSIQUE', true, 'eudiant'),
('etudiant2@student.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Thomas', 'Simon', 'ETUDIANT_CLASSIQUE', true, 'eudiant');

-- CLASSES
INSERT INTO classes (name, description, year, level, tuteur_id) VALUES
('Prepa 1', 'Première année préparatoire', '2024-2025', 'PREPA1', 2),
('Prepa 2', 'Deuxième année préparatoire', '2024-2025', 'PREPA2', 2),
('E3E', 'Troisième année - Étudiants classiques', '2024-2025', 'E3', 2),
('E4E', 'Quatrième année - Étudiants classiques', '2024-2025', 'E4', 3),
('E5E', 'Cinquième année - Étudiants classiques', '2024-2025', 'E5', 3),
('E3A', 'Troisième année - Alternance', '2024-2025', 'E3', 2),
('E4A', 'Quatrième année - Alternance', '2024-2025', 'E4', 3),
('E5A', 'Cinquième année - Alternance', '2024-2025', 'E5', 3);

-- Affecter la classe principale aux utilisateurs
UPDATE users SET class_id = 6 WHERE id = 6; -- alternant1 -> E3A
UPDATE users SET class_id = 7 WHERE id = 7; -- alternant2 -> E4A
UPDATE users SET class_id = 3 WHERE id = 8; -- etudiant1 -> E3E
UPDATE users SET class_id = 4 WHERE id = 9; -- etudiant2 -> E4E

-- MEMBERS
INSERT INTO class_members (class_id, user_id) VALUES
(6, 6), -- alternant1 dans E3A
(7, 7), -- alternant2 dans E4A
(3, 8), -- etudiant1 dans E3E
(4, 9); -- etudiant2 dans E4E

-- REQUIREMENTS
INSERT INTO requirements (title, description, class_id, created_by, due_date, status) VALUES
('Rapport de stage - T1', 'Rédiger le rapport du trimestre 1', 6, 1, CURRENT_TIMESTAMP + INTERVAL '30 days', 'PENDING'),
('Présentation finale', 'Préparer la soutenance finale', 7, 1, CURRENT_TIMESTAMP + INTERVAL '60 days', 'PENDING'),
('Feuille de temps Septembre', 'Soumettre la feuille de temps', 6, 1, CURRENT_TIMESTAMP + INTERVAL '7 days', 'VALIDATED');

-- SOUMISSIONS DEXEMPLE
INSERT INTO requirement_submissions (requirement_id, user_id, file_name, file_path, file_size, mime_type, status, submitted_at)
VALUES
(1, 6, 'rapport_T1.pdf', '/uploads/requirements/rapport_T1.pdf', 1200000, 'application/pdf', 'SUBMITTED', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(3, 6, 'feuille_temps_septembre.pdf', '/uploads/requirements/feuille_temps_septembre.pdf', 500000, 'application/pdf', 'VALIDATED', CURRENT_TIMESTAMP - INTERVAL '3 day');

-- ASSIGNATIONS
INSERT INTO assignments (student_id, maitre_id, tuteur_id)
VALUES
(6, 4, 2),
(7, 5, 3);

-- EVENEMENTS
INSERT INTO events (class_id, title, description, start_date, end_date, type, created_by)
VALUES
(6, 'Réunion tuteur', 'Point de suivi mensuel', CURRENT_TIMESTAMP + INTERVAL '5 day', CURRENT_TIMESTAMP + INTERVAL '5 day 1 hour', 'MEETING', 2),
(7, 'Examen semestriel', 'Épreuve sur le module SIGL', CURRENT_TIMESTAMP + INTERVAL '15 day', CURRENT_TIMESTAMP + INTERVAL '15 day 2 hour', 'EXAM', 3);

-- NOTIFICATIONS
INSERT INTO notifications (user_id, title, message, type, is_read, link, created_at)
VALUES
(1, 'Nouvelles soumissions', 'Des documents attendent une validation', 'INFO', false, '/requirements', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(2, 'Rappel validation', '3 soumissions en attente pour votre classe', 'WARNING', false, '/requirements', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(6, 'Nouvelle exigence', 'Une nouvelle exigence a été publiée pour votre classe', 'INFO', false, '/requirements', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(7, 'Événement programmé', 'Un nouvel événement a été ajouté au calendrier', 'INFO', false, '/calendar', CURRENT_TIMESTAMP - INTERVAL '5 hours');
