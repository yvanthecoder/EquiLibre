const { query } = require('../config/database');

class Journal {
    static async create({ userId, periodStart, periodEnd, content, status }) {
        const sql = `
            INSERT INTO journals (user_id, period_start, period_end, content, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, user_id as "userId", period_start as "periodStart", period_end as "periodEnd",
                      content, status, created_at as "createdAt", updated_at as "updatedAt"
        `;
        const values = [userId, periodStart || null, periodEnd || null, content || null, status || 'DRAFT'];
        const result = await query(sql, values);
        return result.rows[0];
    }

    static async findById(journalId) {
        const sql = `
            SELECT id, user_id as "userId", period_start as "periodStart", period_end as "periodEnd",
                   content, status, created_at as "createdAt", updated_at as "updatedAt",
                   validated_by as "validatedBy", validated_at as "validatedAt", validation_comment as "validationComment"
            FROM journals
            WHERE id = $1
        `;
        const result = await query(sql, [journalId]);
        return result.rows[0];
    }

    static async findByUserId(userId) {
        const sql = `
            SELECT id, user_id as "userId", period_start as "periodStart", period_end as "periodEnd",
                   content, status, created_at as "createdAt", updated_at as "updatedAt",
                   validated_by as "validatedBy", validated_at as "validatedAt", validation_comment as "validationComment"
            FROM journals
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const result = await query(sql, [userId]);
        return result.rows;
    }

    static async findByClassId(classId) {
        const sql = `
            SELECT j.id, j.user_id as "userId", j.period_start as "periodStart", j.period_end as "periodEnd",
                   j.content, j.status, j.created_at as "createdAt", j.updated_at as "updatedAt",
                   j.validated_by as "validatedBy", j.validated_at as "validatedAt", j.validation_comment as "validationComment",
                   u.firstname, u.lastname, u.email
            FROM journals j
            JOIN users u ON u.id = j.user_id
            WHERE u.class_id = $1
            ORDER BY j.created_at DESC
        `;
        const result = await query(sql, [classId]);
        return result.rows;
    }

    static async update(journalId, updates) {
        const allowedFields = ['period_start', 'period_end', 'content', 'status', 'validation_comment', 'validated_by', 'validated_at'];
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

        values.push(journalId);
        const sql = `
            UPDATE journals
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING id, user_id as "userId", period_start as "periodStart", period_end as "periodEnd",
                      content, status, created_at as "createdAt", updated_at as "updatedAt",
                      validated_by as "validatedBy", validated_at as "validatedAt", validation_comment as "validationComment"
        `;
        const result = await query(sql, values);
        return result.rows[0];
    }
}

module.exports = Journal;
