const { query } = require('../config/database');

class Class {
    // Créer une nouvelle classe
    static async create({ name, description, year, level, tuteurId }) {
        const sql = `
            INSERT INTO classes (name, description, year, level, tuteur_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [name, description, year, level, tuteurId];
        const result = await query(sql, values);
        return result.rows[0];
    }

    // Trouver une classe par ID
    static async findById(id) {
        const sql = `
            SELECT c.*,
                   u.firstname as tuteur_firstname,
                   u.lastname as tuteur_lastname,
                   u.email as tuteur_email
            FROM classes c
            LEFT JOIN users u ON c.tuteur_id = u.id
            WHERE c.id = $1 AND c.is_active = true
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    // Obtenir toutes les classes
    static async findAll() {
        const sql = `
            SELECT c.*,
                   u.firstname as tuteur_firstname,
                   u.lastname as tuteur_lastname,
                   (SELECT COUNT(*) FROM class_members WHERE class_id = c.id) as member_count
            FROM classes c
            LEFT JOIN users u ON c.tuteur_id = u.id
            WHERE c.is_active = true
            ORDER BY c.year DESC, c.name
        `;
        const result = await query(sql);
        return result.rows;
    }

    // Obtenir les classes d'un utilisateur
    static async findByUserId(userId) {
        const sql = `
            SELECT c.*,
                   u.firstname as tuteur_firstname,
                   u.lastname as tuteur_lastname
            FROM classes c
            LEFT JOIN users u ON c.tuteur_id = u.id
            INNER JOIN class_members cm ON c.id = cm.class_id
            WHERE cm.user_id = $1 AND c.is_active = true
            ORDER BY c.year DESC, c.name
        `;
        const result = await query(sql, [userId]);
        return result.rows;
    }

    // Obtenir les classes d'un tuteur
    static async findByTuteurId(tuteurId) {
        const sql = `
            SELECT c.*,
                   (SELECT COUNT(*) FROM class_members WHERE class_id = c.id) as member_count
            FROM classes c
            WHERE c.tuteur_id = $1 AND c.is_active = true
            ORDER BY c.year DESC, c.name
        `;
        const result = await query(sql, [tuteurId]);
        return result.rows;
    }

    // Ajouter un membre à une classe
    static async addMember(classId, userId) {
        const sql = `
            INSERT INTO class_members (class_id, user_id)
            VALUES ($1, $2)
            ON CONFLICT (class_id, user_id) DO NOTHING
            RETURNING *
        `;
        const result = await query(sql, [classId, userId]);
        return result.rows[0];
    }

    // Retirer un membre d'une classe
    static async removeMember(classId, userId) {
        const sql = `DELETE FROM class_members WHERE class_id = $1 AND user_id = $2`;
        await query(sql, [classId, userId]);
    }

    // Obtenir les membres d'une classe
    static async getMembers(classId) {
        const sql = `
            SELECT u.id, u.email, u.firstname, u.lastname, u.role, u.company,
                   cm.joined_at
            FROM users u
            INNER JOIN class_members cm ON u.id = cm.user_id
            WHERE cm.class_id = $1 AND u.is_active = true
            ORDER BY u.role, u.lastname, u.firstname
        `;
        const result = await query(sql, [classId]);
        return result.rows;
    }

    // Mettre à jour une classe
    static async update(classId, updates) {
        const allowedFields = ['name', 'description', 'year', 'level', 'tuteur_id'];
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

        values.push(classId);
        const sql = `
            UPDATE classes
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, values);
        return result.rows[0];
    }

    // Supprimer une classe (soft delete)
    static async delete(classId) {
        const sql = `UPDATE classes SET is_active = false WHERE id = $1`;
        await query(sql, [classId]);
    }
}

module.exports = Class;
