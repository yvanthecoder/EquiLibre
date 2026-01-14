const { query } = require('../config/database');

class Interview {
    static async create({ studentId, tuteurId, maitreId, scheduledAt, location, status, summary, createdBy }) {
        const sql = `
            INSERT INTO interviews (student_id, tuteur_id, maitre_id, scheduled_at, location, status, summary, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, student_id as "studentId", tuteur_id as "tuteurId", maitre_id as "maitreId",
                      scheduled_at as "scheduledAt", location, status, summary,
                      created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
        `;
        const values = [
            studentId,
            tuteurId || null,
            maitreId || null,
            scheduledAt,
            location || null,
            status || 'PLANNED',
            summary || null,
            createdBy || null
        ];
        const result = await query(sql, values);
        return result.rows[0];
    }

    static async findById(interviewId) {
        const sql = `
            SELECT id, student_id as "studentId", tuteur_id as "tuteurId", maitre_id as "maitreId",
                   scheduled_at as "scheduledAt", location, status, summary,
                   created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
            FROM interviews
            WHERE id = $1
        `;
        const result = await query(sql, [interviewId]);
        return result.rows[0];
    }

    static async findByStudentId(studentId) {
        const sql = `
            SELECT id, student_id as "studentId", tuteur_id as "tuteurId", maitre_id as "maitreId",
                   scheduled_at as "scheduledAt", location, status, summary,
                   created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
            FROM interviews
            WHERE student_id = $1
            ORDER BY scheduled_at DESC
        `;
        const result = await query(sql, [studentId]);
        return result.rows;
    }

    static async findByTuteurId(tuteurId) {
        const sql = `
            SELECT id, student_id as "studentId", tuteur_id as "tuteurId", maitre_id as "maitreId",
                   scheduled_at as "scheduledAt", location, status, summary,
                   created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
            FROM interviews
            WHERE tuteur_id = $1
            ORDER BY scheduled_at DESC
        `;
        const result = await query(sql, [tuteurId]);
        return result.rows;
    }

    static async findByMaitreId(maitreId) {
        const sql = `
            SELECT id, student_id as "studentId", tuteur_id as "tuteurId", maitre_id as "maitreId",
                   scheduled_at as "scheduledAt", location, status, summary,
                   created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
            FROM interviews
            WHERE maitre_id = $1
            ORDER BY scheduled_at DESC
        `;
        const result = await query(sql, [maitreId]);
        return result.rows;
    }

    static async findAll() {
        const sql = `
            SELECT id, student_id as "studentId", tuteur_id as "tuteurId", maitre_id as "maitreId",
                   scheduled_at as "scheduledAt", location, status, summary,
                   created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
            FROM interviews
            ORDER BY scheduled_at DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    static async update(interviewId, updates) {
        const allowedFields = [
            'student_id',
            'tuteur_id',
            'maitre_id',
            'scheduled_at',
            'location',
            'status',
            'summary'
        ];
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

        values.push(interviewId);
        const sql = `
            UPDATE interviews
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING id, student_id as "studentId", tuteur_id as "tuteurId", maitre_id as "maitreId",
                      scheduled_at as "scheduledAt", location, status, summary,
                      created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
        `;
        const result = await query(sql, values);
        return result.rows[0];
    }

    static async delete(interviewId) {
        const sql = `DELETE FROM interviews WHERE id = $1`;
        await query(sql, [interviewId]);
    }
}

module.exports = Interview;
