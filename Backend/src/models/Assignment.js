const { query } = require('../config/database');

class Assignment {
    // Créer une nouvelle assignation
    static async create({ studentId, maitreId, tuteurId }) {
        const sql = `
            INSERT INTO assignments (student_id, maitre_id, tuteur_id)
            VALUES ($1, $2, $3)
            RETURNING id, student_id, maitre_id, tuteur_id, assigned_at, updated_at
        `;
        const values = [studentId, maitreId, tuteurId];
        const result = await query(sql, values);
        return result.rows[0];
    }

    // Trouver une assignation par ID
    static async findById(id) {
        const sql = `
            SELECT
                a.id,
                a.student_id,
                a.maitre_id,
                a.tuteur_id,
                a.assigned_at,
                a.updated_at,
                s.firstname as student_firstname,
                s.lastname as student_lastname,
                s.email as student_email,
                s.company as student_company,
                s.class_id,
                m.firstname as maitre_firstname,
                m.lastname as maitre_lastname,
                m.email as maitre_email,
                m.company as maitre_company,
                t.firstname as tuteur_firstname,
                t.lastname as tuteur_lastname,
                t.email as tuteur_email
            FROM assignments a
            INNER JOIN users s ON a.student_id = s.id
            LEFT JOIN users m ON a.maitre_id = m.id
            LEFT JOIN users t ON a.tuteur_id = t.id
            WHERE a.id = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    // Obtenir toutes les assignations
    static async findAll(filters = {}) {
        let sql = `
            SELECT
                a.id,
                a.student_id,
                a.maitre_id,
                a.tuteur_id,
                a.assigned_at,
                a.updated_at,
                s.firstname as student_firstname,
                s.lastname as student_lastname,
                s.email as student_email,
                s.role as student_role,
                s.company as student_company,
                s.class_id,
                m.firstname as maitre_firstname,
                m.lastname as maitre_lastname,
                m.email as maitre_email,
                t.firstname as tuteur_firstname,
                t.lastname as tuteur_lastname,
                t.email as tuteur_email
            FROM assignments a
            INNER JOIN users s ON a.student_id = s.id
            LEFT JOIN users m ON a.maitre_id = m.id
            LEFT JOIN users t ON a.tuteur_id = t.id
            WHERE 1=1
        `;
        const values = [];

        // Filtrer par étudiant
        if (filters.studentId) {
            values.push(filters.studentId);
            sql += ` AND a.student_id = $${values.length}`;
        }

        // Filtrer par maître
        if (filters.maitreId) {
            values.push(filters.maitreId);
            sql += ` AND a.maitre_id = $${values.length}`;
        }

        // Filtrer par tuteur
        if (filters.tuteurId) {
            values.push(filters.tuteurId);
            sql += ` AND a.tuteur_id = $${values.length}`;
        }

        // Filtrer par classe
        if (filters.classId) {
            values.push(filters.classId);
            sql += ` AND s.class_id = $${values.length}`;
        }

        sql += ` ORDER BY a.assigned_at DESC`;

        const result = await query(sql, values);
        return result.rows;
    }

    // Trouver l'assignation d'un étudiant
    static async findByStudentId(studentId) {
        const sql = `
            SELECT
                a.id,
                a.student_id,
                a.maitre_id,
                a.tuteur_id,
                a.assigned_at,
                a.updated_at,
                m.firstname as maitre_firstname,
                m.lastname as maitre_lastname,
                m.email as maitre_email,
                m.phone as maitre_phone,
                m.company as maitre_company,
                t.firstname as tuteur_firstname,
                t.lastname as tuteur_lastname,
                t.email as tuteur_email,
                t.phone as tuteur_phone
            FROM assignments a
            LEFT JOIN users m ON a.maitre_id = m.id
            LEFT JOIN users t ON a.tuteur_id = t.id
            WHERE a.student_id = $1
        `;
        const result = await query(sql, [studentId]);
        return result.rows[0];
    }

    // Trouver les étudiants d'un maître
    static async findByMaitreId(maitreId) {
        const sql = `
            SELECT
                a.id,
                a.student_id,
                a.maitre_id,
                a.tuteur_id,
                a.assigned_at,
                s.firstname as student_firstname,
                s.lastname as student_lastname,
                s.email as student_email,
                s.phone as student_phone,
                s.company as student_company,
                s.class_id,
                c.name as class_name,
                t.firstname as tuteur_firstname,
                t.lastname as tuteur_lastname,
                t.email as tuteur_email
            FROM assignments a
            INNER JOIN users s ON a.student_id = s.id
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN users t ON a.tuteur_id = t.id
            WHERE a.maitre_id = $1
            ORDER BY s.lastname, s.firstname
        `;
        const result = await query(sql, [maitreId]);
        return result.rows;
    }

    // Trouver les étudiants d'un tuteur
    static async findByTuteurId(tuteurId) {
        const sql = `
            SELECT
                a.id,
                a.student_id,
                a.maitre_id,
                a.tuteur_id,
                a.assigned_at,
                s.firstname as student_firstname,
                s.lastname as student_lastname,
                s.email as student_email,
                s.phone as student_phone,
                s.company as student_company,
                s.class_id,
                c.name as class_name,
                m.firstname as maitre_firstname,
                m.lastname as maitre_lastname,
                m.email as maitre_email,
                m.company as maitre_company
            FROM assignments a
            INNER JOIN users s ON a.student_id = s.id
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN users m ON a.maitre_id = m.id
            WHERE a.tuteur_id = $1
            ORDER BY s.lastname, s.firstname
        `;
        const result = await query(sql, [tuteurId]);
        return result.rows;
    }

    // Mettre à jour une assignation
    static async update(assignmentId, updates) {
        const allowedFields = ['maitre_id', 'tuteur_id'];
        const fields = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key) && updates[key] !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(updates[key]);
                paramIndex++;
            }
        });

        if (fields.length === 0) {
            throw new Error('Aucun champ à mettre à jour');
        }

        values.push(assignmentId);
        const sql = `
            UPDATE assignments
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING id, student_id, maitre_id, tuteur_id, assigned_at, updated_at
        `;

        const result = await query(sql, values);
        return result.rows[0];
    }

    // Supprimer une assignation
    static async delete(assignmentId) {
        const sql = `DELETE FROM assignments WHERE id = $1`;
        await query(sql, [assignmentId]);
    }

    // Vérifier si un étudiant a déjà une assignation
    static async existsForStudent(studentId) {
        const sql = `SELECT EXISTS(SELECT 1 FROM assignments WHERE student_id = $1) as exists`;
        const result = await query(sql, [studentId]);
        return result.rows[0].exists;
    }

    // Compter les étudiants d'un tuteur
    static async countByTuteurId(tuteurId) {
        const sql = `SELECT COUNT(*) as count FROM assignments WHERE tuteur_id = $1`;
        const result = await query(sql, [tuteurId]);
        return parseInt(result.rows[0].count);
    }

    // Obtenir les statistiques globales
    static async getStats() {
        const sql = `
            SELECT
                COUNT(*) as total_assignments,
                COUNT(DISTINCT student_id) as assigned_students,
                COUNT(DISTINCT maitre_id) as active_maitres,
                COUNT(DISTINCT tuteur_id) as active_tuteurs,
                COUNT(CASE WHEN maitre_id IS NULL THEN 1 END) as without_maitre,
                COUNT(CASE WHEN tuteur_id IS NULL THEN 1 END) as without_tuteur
            FROM assignments
        `;
        const result = await query(sql);
        return result.rows[0];
    }

    // Obtenir les étudiants non assignés
    static async getUnassignedStudents() {
        const sql = `
            SELECT
                u.id,
                u.firstname,
                u.lastname,
                u.email,
                u.company,
                u.class_id,
                c.name as class_name
            FROM users u
            LEFT JOIN classes c ON u.class_id = c.id
            LEFT JOIN assignments a ON u.id = a.student_id
            WHERE u.role IN ('ALTERNANT', 'ETUDIANT_CLASSIQUE')
                AND u.is_active = true
                AND a.id IS NULL
            ORDER BY u.lastname, u.firstname
        `;
        const result = await query(sql);
        return result.rows;
    }

    // Obtenir les maîtres disponibles
    static async getAvailableMaitres() {
        const sql = `
            SELECT
                u.id,
                u.firstname,
                u.lastname,
                u.email,
                u.company,
                u.job_title,
                COUNT(a.id) as student_count
            FROM users u
            LEFT JOIN assignments a ON u.id = a.maitre_id
            WHERE u.role = 'MAITRE_APP'
                AND u.is_active = true
            GROUP BY u.id, u.firstname, u.lastname, u.email, u.company, u.job_title
            ORDER BY student_count ASC, u.lastname, u.firstname
        `;
        const result = await query(sql);
        return result.rows;
    }

    // Obtenir les tuteurs disponibles (avec leur charge actuelle)
    static async getAvailableTuteurs() {
        const sql = `
            SELECT
                u.id,
                u.firstname,
                u.lastname,
                u.email,
                COUNT(a.id) as student_count
            FROM users u
            LEFT JOIN assignments a ON u.id = a.tuteur_id
            WHERE u.role = 'TUTEUR_ECOLE'
                AND u.is_active = true
            GROUP BY u.id, u.firstname, u.lastname, u.email
            HAVING COUNT(a.id) < 2
            ORDER BY student_count ASC, u.lastname, u.firstname
        `;
        const result = await query(sql);
        return result.rows;
    }
}

module.exports = Assignment;
