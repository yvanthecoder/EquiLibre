const { query } = require('../config/database');

class Soutenance {
    static async create({ studentId, title, scheduledAt, location, status, createdBy }) {
        const sql = `
            WITH created AS (
                INSERT INTO soutenances (student_id, title, scheduled_at, location, status, created_by)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            )
            SELECT created.id,
                   created.student_id as "studentId",
                   u.class_id as "classId",
                   u.firstname as "studentFirstName",
                   u.lastname as "studentLastName",
                   created.title,
                   created.scheduled_at as "scheduledAt",
                   created.location,
                   created.status,
                   created.created_by as "createdBy",
                   created.created_at as "createdAt",
                   created.updated_at as "updatedAt"
            FROM created
            JOIN users u ON u.id = created.student_id
        `;
        const values = [studentId, title, scheduledAt, location || null, status || 'PLANNED', createdBy || null];
        const result = await query(sql, values);
        return result.rows[0];
    }

    static async findById(soutenanceId) {
        const sql = `
            SELECT s.id,
                   s.student_id as "studentId",
                   u.class_id as "classId",
                   u.firstname as "studentFirstName",
                   u.lastname as "studentLastName",
                   s.title,
                   s.scheduled_at as "scheduledAt",
                   s.location,
                   s.status,
                   s.created_by as "createdBy",
                   s.created_at as "createdAt",
                   s.updated_at as "updatedAt",
                   COALESCE(
                     json_agg(json_build_object('id', ju.id, 'firstname', ju.firstname, 'lastname', ju.lastname, 'role', ju.role))
                     FILTER (WHERE ju.id IS NOT NULL),
                     '[]'
                   ) as "juryMembers",
                   AVG(e.overall_score) FILTER (WHERE e.status = 'VALIDATED') as "validatedScore"
            FROM soutenances s
            JOIN users u ON u.id = s.student_id
            LEFT JOIN soutenance_jury sj ON sj.soutenance_id = s.id
            LEFT JOIN users ju ON ju.id = sj.user_id
            LEFT JOIN evaluations e ON e.context_type = 'SOUTENANCE' AND e.context_id = s.id AND e.student_id = s.student_id
            WHERE s.id = $1
            GROUP BY s.id, u.class_id, u.firstname, u.lastname
        `;
        const result = await query(sql, [soutenanceId]);
        return result.rows[0];
    }

    static async findByClassId(classId) {
        const sql = `
            SELECT s.id,
                   s.student_id as "studentId",
                   u.class_id as "classId",
                   u.firstname as "studentFirstName",
                   u.lastname as "studentLastName",
                   s.title,
                   s.scheduled_at as "scheduledAt",
                   s.location,
                   s.status,
                   s.created_by as "createdBy",
                   s.created_at as "createdAt",
                   s.updated_at as "updatedAt",
                   COALESCE(
                     json_agg(json_build_object('id', ju.id, 'firstname', ju.firstname, 'lastname', ju.lastname, 'role', ju.role))
                     FILTER (WHERE ju.id IS NOT NULL),
                     '[]'
                   ) as "juryMembers",
                   AVG(e.overall_score) FILTER (WHERE e.status = 'VALIDATED') as "validatedScore"
            FROM soutenances s
            JOIN users u ON u.id = s.student_id
            LEFT JOIN soutenance_jury sj ON sj.soutenance_id = s.id
            LEFT JOIN users ju ON ju.id = sj.user_id
            LEFT JOIN evaluations e ON e.context_type = 'SOUTENANCE' AND e.context_id = s.id AND e.student_id = s.student_id
            WHERE u.class_id = $1
            GROUP BY s.id, u.class_id, u.firstname, u.lastname
            ORDER BY s.scheduled_at DESC
        `;
        const result = await query(sql, [classId]);
        return result.rows;
    }

    static async findByStudentId(studentId) {
        const sql = `
            SELECT s.id,
                   s.student_id as "studentId",
                   u.class_id as "classId",
                   u.firstname as "studentFirstName",
                   u.lastname as "studentLastName",
                   s.title,
                   s.scheduled_at as "scheduledAt",
                   s.location,
                   s.status,
                   s.created_by as "createdBy",
                   s.created_at as "createdAt",
                   s.updated_at as "updatedAt",
                   COALESCE(
                     json_agg(json_build_object('id', ju.id, 'firstname', ju.firstname, 'lastname', ju.lastname, 'role', ju.role))
                     FILTER (WHERE ju.id IS NOT NULL),
                     '[]'
                   ) as "juryMembers",
                   AVG(e.overall_score) FILTER (WHERE e.status = 'VALIDATED') as "validatedScore"
            FROM soutenances s
            JOIN users u ON u.id = s.student_id
            LEFT JOIN soutenance_jury sj ON sj.soutenance_id = s.id
            LEFT JOIN users ju ON ju.id = sj.user_id
            LEFT JOIN evaluations e ON e.context_type = 'SOUTENANCE' AND e.context_id = s.id AND e.student_id = s.student_id
            WHERE s.student_id = $1
            GROUP BY s.id, u.class_id, u.firstname, u.lastname
            ORDER BY s.scheduled_at DESC
        `;
        const result = await query(sql, [studentId]);
        return result.rows;
    }

    static async findForUser(userId) {
        const sql = `
            SELECT DISTINCT s.id,
                   s.student_id as "studentId",
                   u.class_id as "classId",
                   u.firstname as "studentFirstName",
                   u.lastname as "studentLastName",
                   s.title,
                   s.scheduled_at as "scheduledAt",
                   s.location,
                   s.status,
                   s.created_by as "createdBy",
                   s.created_at as "createdAt",
                   s.updated_at as "updatedAt",
                   COALESCE(
                     json_agg(json_build_object('id', ju.id, 'firstname', ju.firstname, 'lastname', ju.lastname, 'role', ju.role))
                     FILTER (WHERE ju.id IS NOT NULL),
                     '[]'
                   ) as "juryMembers",
                   AVG(e.overall_score) FILTER (WHERE e.status = 'VALIDATED') as "validatedScore"
            FROM soutenances s
            JOIN users u ON u.id = s.student_id
            LEFT JOIN soutenance_jury sj ON sj.soutenance_id = s.id AND sj.user_id = $1
            LEFT JOIN soutenance_jury sj_all ON sj_all.soutenance_id = s.id
            LEFT JOIN users ju ON ju.id = sj_all.user_id
            LEFT JOIN evaluations e ON e.context_type = 'SOUTENANCE' AND e.context_id = s.id AND e.student_id = s.student_id
            LEFT JOIN assignments a ON a.student_id = s.student_id
            WHERE s.student_id = $1
               OR sj.user_id IS NOT NULL
               OR a.tuteur_id = $1
               OR a.maitre_id = $1
            GROUP BY s.id, u.class_id, u.firstname, u.lastname
            ORDER BY s.scheduled_at DESC
        `;
        const result = await query(sql, [userId]);
        return result.rows;
    }

    static async findAll() {
        const sql = `
            SELECT s.id,
                   s.student_id as "studentId",
                   u.class_id as "classId",
                   u.firstname as "studentFirstName",
                   u.lastname as "studentLastName",
                   s.title,
                   s.scheduled_at as "scheduledAt",
                   s.location,
                   s.status,
                   s.created_by as "createdBy",
                   s.created_at as "createdAt",
                   s.updated_at as "updatedAt",
                   COALESCE(
                     json_agg(json_build_object('id', ju.id, 'firstname', ju.firstname, 'lastname', ju.lastname, 'role', ju.role))
                     FILTER (WHERE ju.id IS NOT NULL),
                     '[]'
                   ) as "juryMembers",
                   AVG(e.overall_score) FILTER (WHERE e.status = 'VALIDATED') as "validatedScore"
            FROM soutenances s
            JOIN users u ON u.id = s.student_id
            LEFT JOIN soutenance_jury sj ON sj.soutenance_id = s.id
            LEFT JOIN users ju ON ju.id = sj.user_id
            LEFT JOIN evaluations e ON e.context_type = 'SOUTENANCE' AND e.context_id = s.id AND e.student_id = s.student_id
            GROUP BY s.id, u.class_id, u.firstname, u.lastname
            ORDER BY s.scheduled_at DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    static async update(soutenanceId, updates) {
        const allowedFields = ['student_id', 'title', 'scheduled_at', 'location', 'status'];
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
            WITH updated AS (
                UPDATE soutenances
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${paramIndex}
                RETURNING *
            )
            SELECT updated.id,
                   updated.student_id as "studentId",
                   u.class_id as "classId",
                   u.firstname as "studentFirstName",
                   u.lastname as "studentLastName",
                   updated.title,
                   updated.scheduled_at as "scheduledAt",
                   updated.location,
                   updated.status,
                   updated.created_by as "createdBy",
                   updated.created_at as "createdAt",
                   updated.updated_at as "updatedAt"
            FROM updated
            JOIN users u ON u.id = updated.student_id
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
