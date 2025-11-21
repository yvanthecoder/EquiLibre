const { query } = require('../config/database');

class AssignmentLog {
    static async create(entry) {
        const sql = `
            INSERT INTO assignment_logs (
                assignment_id,
                student_id,
                old_maitre_id,
                new_maitre_id,
                old_tuteur_id,
                new_tuteur_id,
                action,
                changed_by
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *
        `;
        const values = [
            entry.assignment_id || null,
            entry.student_id,
            entry.old_maitre_id || null,
            entry.new_maitre_id || null,
            entry.old_tuteur_id || null,
            entry.new_tuteur_id || null,
            entry.action,
            entry.changed_by || null
        ];
        const result = await query(sql, values);
        return result.rows[0];
    }

    static async findAll(assignmentId) {
        const values = [];
        let sql = `
            SELECT
                al.*,
                u.firstname as changer_firstname,
                u.lastname as changer_lastname
            FROM assignment_logs al
            LEFT JOIN users u ON al.changed_by = u.id
            WHERE 1=1
        `;
        if (assignmentId) {
            values.push(assignmentId);
            sql += ` AND al.assignment_id = $${values.length}`;
        }
        sql += ' ORDER BY al.created_at DESC';
        const result = await query(sql, values);
        return result.rows;
    }
}

module.exports = AssignmentLog;
