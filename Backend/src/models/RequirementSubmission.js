const { query } = require('../config/database');

class RequirementSubmission {
    // CrAcer une nouvelle soumission
    static async create({ requirementId, userId, fileName, filePath, fileSize, mimeType }) {
        const sql = `
            INSERT INTO requirement_submissions (requirement_id, user_id, file_name, file_path, file_size, mime_type)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id,
                      requirement_id as "requirementId",
                      user_id as "userId",
                      file_name as "fileName",
                      file_path as "filePath",
                      file_size as "fileSize",
                      mime_type as "mimeType",
                      status,
                      feedback,
                      submitted_at as "submittedAt",
                      validated_at as "validatedAt",
                      updated_at as "updatedAt"
        `;
        const values = [requirementId, userId, fileName, filePath, fileSize, mimeType];
        const result = await query(sql, values);
        return result.rows[0];
    }

    static async findByRequirement(requirementId) {
        const sql = `
            SELECT rs.id,
                   rs.requirement_id as "requirementId",
                   rs.user_id as "userId",
                   rs.file_name as "fileName",
                   rs.file_path as "filePath",
                   rs.file_size as "fileSize",
                   rs.mime_type as "mimeType",
                   rs.status,
                   rs.feedback,
                   rs.submitted_at as "submittedAt",
                   rs.validated_at as "validatedAt",
                   rs.updated_at as "updatedAt",
                   u.firstname,
                   u.lastname,
                   u.email
            FROM requirement_submissions rs
            JOIN users u ON u.id = rs.user_id
            WHERE rs.requirement_id = $1
            ORDER BY rs.submitted_at DESC
        `;
        const result = await query(sql, [requirementId]);
        return result.rows;
    }

    static async findById(submissionId) {
        const sql = `
            SELECT id,
                   requirement_id as "requirementId",
                   user_id as "userId",
                   file_name as "fileName",
                   file_path as "filePath",
                   file_size as "fileSize",
                   mime_type as "mimeType",
                   status,
                   feedback,
                   submitted_at as "submittedAt",
                   validated_at as "validatedAt",
                   updated_at as "updatedAt"
            FROM requirement_submissions
            WHERE id = $1
        `;
        const result = await query(sql, [submissionId]);
        return result.rows[0];
    }

    static async updateStatus(submissionId, status, feedback) {
        const sql = `
            UPDATE requirement_submissions
            SET status = $1,
                feedback = $2,
                validated_at = CASE WHEN $1 IN ('VALIDATED','REJECTED') THEN CURRENT_TIMESTAMP ELSE validated_at END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id,
                      requirement_id as "requirementId",
                      user_id as "userId",
                      file_name as "fileName",
                      file_path as "filePath",
                      file_size as "fileSize",
                      mime_type as "mimeType",
                      status,
                      feedback,
                      submitted_at as "submittedAt",
                      validated_at as "validatedAt",
                      updated_at as "updatedAt"
        `;
        const result = await query(sql, [status, feedback, submissionId]);
        return result.rows[0];
    }
}

module.exports = RequirementSubmission;
