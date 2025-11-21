const { query } = require('../config/database');

class Requirement {
    // CrAcer un requirement
    static async create({ title, description, classId, createdBy, dueDate }) {
        const sql = `
            INSERT INTO requirements (title, description, class_id, created_by, due_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id,
                      title,
                      description,
                      class_id as "classId",
                      created_by as "createdBy",
                      due_date as "dueDate",
                      status,
                      created_at as "createdAt"
        `;
        const values = [title, description, classId, createdBy, dueDate];
        const result = await query(sql, values);
        return result.rows[0];
    }

    // Trouver par ID
    static async findById(id) {
        const sql = `
            SELECT r.id,
                   r.title,
                   r.description,
                   r.class_id as "classId",
                   r.created_by as "createdBy",
                   r.due_date as "dueDate",
                   r.status,
                   r.created_at as "createdAt",
                   r.updated_at as "updatedAt",
                   r.validation_comment as "validationComment",
                   r.validated_at as "validatedAt",
                   r.validated_by as "validatedBy",
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
            SELECT r.id,
                   r.title,
                   r.description,
                   r.class_id as "classId",
                   r.created_by as "createdBy",
                   r.due_date as "dueDate",
                   r.status,
                   r.created_at as "createdAt",
                   r.updated_at as "updatedAt",
                   r.validation_comment as "validationComment",
                   r.validated_at as "validatedAt",
                   r.validated_by as "validatedBy",
                   u1.firstname as creator_firstname,
                   u1.lastname as creator_lastname,
                   u2.firstname as validator_firstname,
                   u2.lastname as validator_lastname
            FROM requirements r
            LEFT JOIN users u1 ON r.created_by = u1.id
            LEFT JOIN users u2 ON r.validated_by = u2.id
            WHERE r.class_id = $1
            ORDER BY r.due_date ASC NULLS LAST, r.created_at DESC
        `;
        const result = await query(sql, [classId]);
        return result.rows;
    }

    // Obtenir les requirements d'un utilisateur (via ses classes)
    static async findByUserId(userId) {
        const sql = `
            SELECT DISTINCT r.id,
                   r.title,
                   r.description,
                   r.class_id as "classId",
                   r.created_by as "createdBy",
                   r.due_date as "dueDate",
                   r.status,
                   r.created_at as "createdAt",
                   r.updated_at as "updatedAt",
                   r.validation_comment as "validationComment",
                   r.validated_at as "validatedAt",
                   r.validated_by as "validatedBy",
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
            ORDER BY r.due_date ASC NULLS LAST, r.created_at DESC
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
            RETURNING id,
                      title,
                      description,
                      class_id as "classId",
                      created_by as "createdBy",
                      due_date as "dueDate",
                      status,
                      created_at as "createdAt",
                      updated_at as "updatedAt",
                      validation_comment as "validationComment",
                      validated_at as "validatedAt",
                      validated_by as "validatedBy"
        `;
        const values = [status, validatedBy, comment, requirementId];
        const result = await query(sql, values);
        return result.rows[0];
    }

    // Mettre A� jour un requirement
    static async update(requirementId, updates) {
        const allowedFields = ['title', 'description', 'due_date', 'status'];
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
            throw new Error('Aucun champ A� mettre A� jour');
        }

        values.push(requirementId);
        const sql = `
            UPDATE requirements
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING id,
                      title,
                      description,
                      class_id as "classId",
                      created_by as "createdBy",
                      due_date as "dueDate",
                      status,
                      created_at as "createdAt",
                      updated_at as "updatedAt",
                      validation_comment as "validationComment",
                      validated_at as "validatedAt",
                      validated_by as "validatedBy"
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
                COUNT(CASE WHEN status = 'VALIDATED' THEN 1 END) as validated,
                COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected,
                COUNT(CASE WHEN status = 'LOCKED' THEN 1 END) as locked
            FROM requirements
            WHERE class_id = $1
        `;
        const result = await query(sql, [classId]);
        return result.rows[0];
    }
}

module.exports = Requirement;
