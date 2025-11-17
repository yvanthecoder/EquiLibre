const { query } = require('../config/database');

class Requirement {
    // Créer un requirement
    static async create({ title, description, classId, createdBy, deadline }) {
        const sql = `
            INSERT INTO requirements (title, description, class_id, created_by, deadline)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [title, description, classId, createdBy, deadline];
        const result = await query(sql, values);
        return result.rows[0];
    }

    // Trouver par ID
    static async findById(id) {
        const sql = `
            SELECT r.*,
                   u1.firstname as creator_firstname,
                   u1.lastname as creator_lastname,
                   u2.firstname as validator_firstname,
                   u2.lastname as validator_lastname,
                   c.name as class_name
            FROM requirements r
            LEFT JOIN users u1 ON r.created_by = u1.id
            LEFT JOIN users u2 ON r.validated_by = u2.id
            LEFT JOIN classes c ON r.class_id = c.id
            WHERE r.id = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    // Obtenir tous les requirements d'une classe
    static async findByClassId(classId) {
        const sql = `
            SELECT r.*,
                   u1.firstname as creator_firstname,
                   u1.lastname as creator_lastname,
                   u2.firstname as validator_firstname,
                   u2.lastname as validator_lastname
            FROM requirements r
            LEFT JOIN users u1 ON r.created_by = u1.id
            LEFT JOIN users u2 ON r.validated_by = u2.id
            WHERE r.class_id = $1
            ORDER BY r.deadline ASC, r.created_at DESC
        `;
        const result = await query(sql, [classId]);
        return result.rows;
    }

    // Obtenir les requirements d'un utilisateur (via ses classes)
    static async findByUserId(userId) {
        const sql = `
            SELECT DISTINCT r.*,
                   u1.firstname as creator_firstname,
                   u1.lastname as creator_lastname,
                   u2.firstname as validator_firstname,
                   u2.lastname as validator_lastname,
                   c.name as class_name
            FROM requirements r
            LEFT JOIN users u1 ON r.created_by = u1.id
            LEFT JOIN users u2 ON r.validated_by = u2.id
            INNER JOIN classes c ON r.class_id = c.id
            INNER JOIN class_members cm ON c.id = cm.class_id
            WHERE cm.user_id = $1
            ORDER BY r.deadline ASC, r.created_at DESC
        `;
        const result = await query(sql, [userId]);
        return result.rows;
    }

    // Valider un requirement
    static async validate(requirementId, validatedBy, status, comment) {
        const sql = `
            UPDATE requirements
            SET status = $1,
                validated_by = $2,
                validated_at = CURRENT_TIMESTAMP,
                validation_comment = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `;
        const values = [status, validatedBy, comment, requirementId];
        const result = await query(sql, values);
        return result.rows[0];
    }

    // Mettre à jour un requirement
    static async update(requirementId, updates) {
        const allowedFields = ['title', 'description', 'deadline', 'status'];
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

        values.push(requirementId);
        const sql = `
            UPDATE requirements
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, values);
        return result.rows[0];
    }

    // Supprimer un requirement
    static async delete(requirementId) {
        const sql = `DELETE FROM requirements WHERE id = $1`;
        await query(sql, [requirementId]);
    }

    // Obtenir les statistiques
    static async getStats(classId) {
        const sql = `
            SELECT
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
                COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected
            FROM requirements
            WHERE class_id = $1
        `;
        const result = await query(sql, [classId]);
        return result.rows[0];
    }
}

module.exports = Requirement;
