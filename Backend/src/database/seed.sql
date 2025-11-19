-- RESET
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE requirements CASCADE;
TRUNCATE TABLE class_members CASCADE;
TRUNCATE TABLE classes CASCADE;
TRUNCATE TABLE users CASCADE;

ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE classes_id_seq RESTART WITH 1;
ALTER SEQUENCE class_members_id_seq RESTART WITH 1;
ALTER SEQUENCE requirements_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;

-- ADMIN
INSERT INTO users (email, password, firstname, lastname, role, is_verified)
VALUES ('admin@equilibre.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Admin', 'Plateforme', 'ADMIN', true);

-- TUTEURS
INSERT INTO users (email, password, firstname, lastname, role, phone, is_verified) VALUES
('tuteur1@equilibre.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Marie', 'Dupont', 'TUTEUR_ECOLE', '0601020304', true),
('tuteur2@equilibre.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Pierre', 'Martin', 'TUTEUR_ECOLE', '0602030405', true);

-- MAITRES
INSERT INTO users (email, password, firstname, lastname, role, company, phone, is_verified) VALUES
('maitre1@entreprise.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Jean', 'Dubois', 'MAITRE_APP', 'Tech Corp', '0603040506', true),
('maitre2@entreprise.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Sophie', 'Bernard', 'MAITRE_APP', 'Innovation SA', '0604050607', true);

-- ALTERNANTS
INSERT INTO users (email, password, firstname, lastname, role, company, is_verified) VALUES
('alternant1@student.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Lucas', 'Petit', 'ALTERNANT', 'Tech Corp', true),
('alternant2@student.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Emma', 'Roux', 'ALTERNANT', 'Innovation SA', true);

-- ÉTUDIANTS CLASSIQUES
INSERT INTO users (email, password, firstname, lastname, role, is_verified) VALUES
('etudiant1@student.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Julie', 'Moreau', 'ETUDIANT_CLASSIQUE', true),
('etudiant2@student.com', '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka', 'Thomas', 'Simon', 'ETUDIANT_CLASSIQUE', true);

-- CLASSES
INSERT INTO classes (name, description, year, level, tuteur_id) VALUES
('Master 1 SIGL - Groupe A', 'Première année du Master SIGL - Groupe A', '2024-2025', 'M1', 2),
('Master 2 SIGL - Groupe B', 'Deuxième année du Master SIGL - Groupe B', '2024-2025', 'M2', 3);

-- MEMBERS
INSERT INTO class_members (class_id, user_id) VALUES
(1, 6), (1, 8),
(2, 7), (2, 9);

-- REQUIREMENTS
INSERT INTO requirements (title, description, class_id, created_by, deadline, status) VALUES
('Rapport de stage - T1', 'Rédiger le rapport du trimestre 1', 1, 1, CURRENT_TIMESTAMP + INTERVAL '30 days', 'PENDING'),
('Présentation finale', 'Préparer la soutenance finale', 2, 1, CURRENT_TIMESTAMP + INTERVAL '60 days', 'PENDING'),
('Feuille de temps Septembre', 'Soumettre la feuille de temps', 1, 1, CURRENT_TIMESTAMP + INTERVAL '7 days', 'APPROVED');
