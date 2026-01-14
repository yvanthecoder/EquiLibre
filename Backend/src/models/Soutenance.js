const { query } = require('../config/database');

class Soutenance {
    static async create({ classId, title, scheduledAt, location, status, createdBy }) {
        const sql = `
            INSERT INTO soutenances (class_id, title, scheduled_at, location, status, created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, class_id as "classId", title, scheduled_at as "scheduledAt", location, status,
                      created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
        `;
        const values = [classId, title, scheduledAt, location || null, status || 'PLANNED', createdBy || null];
        const result = await query(sql, values);
        return result.rows[0];
    }

    static async findById(soutenanceId) {
        const sql = `
            SELECT id, class_id as "classId", title, scheduled_at as "scheduledAt", location, status,
                   created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
            FROM soutenances
            WHERE id = $1
        `;
        const result = await query(sql, [soutenanceId]);
        return result.rows[0];
    }

    static async findByClassId(classId) {
        const sql = `
            SELECT id, class_id as "classId", title, scheduled_at as "scheduledAt", location, status,
                   created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
            FROM soutenances
            WHERE class_id = $1
            ORDER BY scheduled_at DESC
        `;
        const result = await query(sql, [classId]);
        return result.rows;
    }

    static async findForUser(userId) {
        const sql = `
            SELECT DISTINCT s.id, s.class_id as "classId", s.title, s.scheduled_at as "scheduledAt",
                   s.location, s.status, s.created_by as "createdBy", s.created_at as "createdAt", s.updated_at as "updatedAt"
            FROM soutenances s
            LEFT JOIN class_members cm ON cm.class_id = s.class_id AND cm.user_id = $1
            LEFT JOIN soutenance_jury sj ON sj.soutenance_id = s.id AND sj.user_id = $1
            WHERE cm.user_id IS NOT NULL OR sj.user_id IS NOT NULL
            ORDER BY s.scheduled_at DESC
        `;
        const result = await query(sql, [userId]);
        return result.rows;
    }

    static async update(soutenanceId, updates) {
        const allowedFields = ['class_id', 'title', 'scheduled_at', 'location', 'status'];
        const fields = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(updates).forEach((key) => {
            if (allowedFields.includes(key) && updates[key] !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(updates[key]);
                paramIndex += 1;
            }
        });

        if (fields.length === 0) {
            throw new Error('Aucun champ à mettre à jour');
        }

        values.push(soutenanceId);
        const sql = `
            UPDATE soutenances
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING id, class_id as "classId", title, scheduled_at as "scheduledAt", location, status,
                      created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
        `;
        const result = await query(sql, values);
        return result.rows[0];
    }

    static async delete(soutenanceId) {
        const sql = `DELETE FROM soutenances WHERE id = $1`;
        await query(sql, [soutenanceId]);
    }

    static async addJury(soutenanceId, userId) {
        const sql = `
            INSERT INTO soutenance_jury (soutenance_id, user_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING id, soutenance_id as "soutenanceId", user_id as "userId"
        `;
        const result = await query(sql, [soutenanceId, userId]);
        return result.rows[0];
    }

    static async removeJury(soutenanceId, userId) {
        const sql = `
            DELETE FROM soutenance_jury
            WHERE soutenance_id = $1 AND user_id = $2
        `;
        await query(sql, [soutenanceId, userId]);
    }

    static async listJury(soutenanceId) {
        const sql = `
            SELECT u.id, u.firstname, u.lastname, u.email, u.role
            FROM soutenance_jury sj
            JOIN users u ON u.id = sj.user_id
            WHERE sj.soutenance_id = $1
            ORDER BY u.lastname, u.firstname
        `;
        const result = await query(sql, [soutenanceId]);
        return result.rows;
    }
}

module.exports = Soutenance;
