USE equilibre_db;

-- =========================================================
-- 1. UTILISATEURS (TUTEURS, MAITRES, APPRENTIS, AUTRES)
-- =========================================================

INSERT INTO utilisateur (nom, prenom, email, mot_de_passe) VALUES
('Martin', 'Lucas', 'lucas.martin@example.com', 'hash123'),
('Durand', 'Emma', 'emma.durand@example.com', 'hash123'),
('Bernard', 'Hugo', 'hugo.bernard@example.com', 'hash123'),
('Moreau', 'Lina', 'lina.moreau@example.com', 'hash123'),
('Petit', 'Arthur', 'arthur.petit@example.com', 'hash123'),
('Garnier', 'Sarah', 'sarah.garnier@example.com', 'hash123'),
('Roux', 'Nicolas', 'nicolas.roux@example.com', 'hash123'),
('Baron', 'Chloe', 'chloe.baron@example.com', 'hash123'),
('Fabre', 'Paul', 'paul.fabre@example.com', 'hash123'),
('Carpentier', 'Alice', 'alice.carpentier@example.com', 'hash123');

-- 10 utilisateurs créés : 4 apprentis, 3 tuteurs, 3 maîtres

-- =========================================================
-- 2. PROMOTIONS
-- =========================================================

INSERT INTO promotion (annee, nom) VALUES
('2024-2025', 'Promo A'),
('2025-2026', 'Promo B');

-- =========================================================
-- 3. APPRENTIS (id = utilisateur.id)
-- =========================================================

INSERT INTO apprenti (id, promotion_id) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 2);

-- =========================================================
-- 4. ENTREPRISES
-- =========================================================

INSERT INTO entreprise (nom, adresse, siret) VALUES
('TechVision', '12 rue des Lilas, Paris', '55239876100014'),
('InnovAction', '27 avenue Victor Hugo, Lyon', '48923716500058'),
('GreenFuture', '5 impasse des Fleurs, Marseille', '43988761200032');

-- =========================================================
-- 5. MAITRES D’APPRENTISSAGE (id = utilisateur.id)
-- =========================================================

INSERT INTO maitre_apprentissage (id, entreprise_id) VALUES
(5, 1),
(6, 2),
(7, 3);

-- =========================================================
-- 6. TUTEURS PÉDAGOGIQUES (id = utilisateur.id)
-- =========================================================

INSERT INTO tuteur_pedagogique (id) VALUES
(8),
(9),
(10);

-- =========================================================
-- 7. JOURNAUX DE FORMATION
-- =========================================================

INSERT INTO journal_formation (apprenti_id, date_creation) VALUES
(1, '2025-01-05'),
(2, '2025-01-10'),
(3, '2025-01-12'),
(4, '2025-01-20');

-- =========================================================
-- 8. ACTIVITÉS DU JOURNAL
-- =========================================================

INSERT INTO activite (journal_id, description, date_realisation) VALUES
(1, 'Développement d’un module React', '2025-01-07'),
(1, 'Mise en place d’une API Node', '2025-01-08'),
(2, 'Analyse de logs serveurs', '2025-01-11'),
(3, 'Optimisation d’une base SQL', '2025-01-15'),
(4, 'Création d’un dashboard frontend', '2025-01-25');

-- =========================================================
-- 9. NOTES MENSUELLES
-- =========================================================

INSERT INTO note_mensuelle (apprenti_id, mois, annee, note, commentaires, date_depot) VALUES
(1, 'Janvier', 2025, 16.5, 'Très bonne progression', '2025-02-01'),
(2, 'Janvier', 2025, 14.0, 'Bon travail mais manque de rigueur', '2025-02-01'),
(3, 'Janvier', 2025, 15.2, 'Bonne autonomie', '2025-02-03'),
(4, 'Janvier', 2025, 13.7, 'Doit approfondir certaines notions', '2025-02-05');

-- =========================================================
-- 10. FICHES SYNTHÈSE
-- =========================================================

INSERT INTO fiche_synthese (apprenti_id, semestre, contenu, date_depot) VALUES
(1, 'S1', 'Synthèse des acquis du semestre 1', '2025-02-10'),
(2, 'S1', 'Rapport détaillé des missions effectuées', '2025-02-12'),
(3, 'S1', 'Retour sur les compétences acquises', '2025-02-15'),
(4, 'S1', 'Missions diverses chez l’entreprise', '2025-02-20');

-- =========================================================
-- 11. RAPPORTS
-- =========================================================

INSERT INTO rapport (apprenti_id, type, semestre, date_depot, fichier) VALUES
(1, 'Rapport intermédiaire', 'S1', '2025-02-18', 'rapport_1.pdf'),
(2, 'Rapport intermédiaire', 'S1', '2025-02-20', 'rapport_2.pdf'),
(3, 'Rapport final', 'S1', '2025-02-22', 'rapport_3.pdf'),
(4, 'Rapport final', 'S1', '2025-02-23', 'rapport_4.pdf');

-- =========================================================
-- 12. SLIDES DE PRÉSENTATION
-- =========================================================

INSERT INTO slide_presentation (apprenti_id, type, semestre, date_depot, fichier) VALUES
(1, 'Soutenance S1', 'S1', '2025-02-25', 'slides_1.pdf'),
(2, 'Soutenance S1', 'S1', '2025-02-26', 'slides_2.pdf'),
(3, 'Soutenance S1', 'S1', '2025-02-27', 'slides_3.pdf'),
(4, 'Soutenance S1', 'S1', '2025-02-28', 'slides_4.pdf');

-- =========================================================
-- 13. JURY
-- =========================================================

INSERT INTO jury VALUES
(1),
(2);

-- =========================================================
-- 14. MEMBRES DU JURY
-- =========================================================

INSERT INTO jury_membre (jury_id, utilisateur_id) VALUES
(1, 8),
(1, 9),
(2, 10),
(2, 5);

-- =========================================================
-- 15. SOUTENANCES
-- =========================================================

INSERT INTO soutenance (date_soutenance, heure, lieu, jury_id, apprenti_id) VALUES
('2025-03-10', '14:00', 'Salle 101', 1, 1),
('2025-03-11', '10:00', 'Salle 102', 1, 2),
('2025-03-12', '09:30', 'Salle 103', 2, 3),
('2025-03-13', '11:00', 'Salle 104', 2, 4);

-- =========================================================
-- 16. ENTRETIENS SEMESTRIELS
-- =========================================================

INSERT INTO entretien_semestriel (date_entretien, compte_rendu, apprenti_id) VALUES
('2025-01-15', 'Bon début d’année, apprentissage efficace.', 1),
('2025-01-17', 'À encourager mais attention aux délais.', 2),
('2025-01-20', 'Très bonne maîtrise technique.', 3),
('2025-01-25', 'Axe d’amélioration sur la communication.', 4);

-- ===========================
-- FIN DU DATASET
-- ===========================
