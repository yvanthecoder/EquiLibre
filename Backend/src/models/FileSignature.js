const { query } = require('../config/database');

class FileSignature {
    static async sign(fileId, userId) {
        const sql = `
            INSERT INTO file_signatures (file_id, user_id)
            VALUES ($1, $2)
            ON CONFLICT (file_id, user_id) DO NOTHING
            RETURNING id, file_id as "fileId", user_id as "userId", signed_at as "signedAt"
        `;
        const result = await query(sql, [fileId, userId]);
        return result.rows[0];
    }

    static async list(fileId) {
        const sql = `
            SELECT fs.id,
                   fs.file_id as "fileId",
                   fs.user_id as "userId",
                   fs.signed_at as "signedAt",
                   u.firstname,
                   u.lastname,
                   u.email
            FROM file_signatures fs
            LEFT JOIN users u ON fs.user_id = u.id
            WHERE fs.file_id = $1
            ORDER BY fs.signed_at DESC
        `;
        const result = await query(sql, [fileId]);
        return result.rows;
    }
}

module.exports = FileSignature;
