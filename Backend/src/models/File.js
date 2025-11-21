const { query } = require('../config/database');

class FileModel {
    static async create({ userId, classId, fileName, storedName, filePath, fileSize, mimeType, visibilityRole, requiresSignature, parentFileId, version }) {
        const sql = `
            INSERT INTO files (user_id, class_id, file_name, stored_name, file_path, file_size, mime_type, visibility_role, requires_signature, parent_file_id, version)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id,
                      user_id as "userId",
                      class_id as "classId",
                      file_name as "fileName",
                      stored_name as "storedName",
                      file_path as "filePath",
                      file_size as "fileSize",
                      mime_type as "fileType",
                      visibility_role as "visibilityRole",
                      requires_signature as "requiresSignature",
                      parent_file_id as "parentFileId",
                      version,
                      uploaded_at as "uploadedAt"
        `;
        const result = await query(sql, [userId, classId || null, fileName, storedName, filePath, fileSize, mimeType, visibilityRole || null, requiresSignature || false, parentFileId || null, version || 1]);
        return result.rows[0];
    }

    static async findById(id) {
        const sql = `
            SELECT id,
                   user_id as "userId",
                   class_id as "classId",
                   file_name as "fileName",
                   stored_name as "storedName",
                   file_path as "filePath",
                   file_size as "fileSize",
                   mime_type as "fileType",
                   visibility_role as "visibilityRole",
                   requires_signature as "requiresSignature",
                   parent_file_id as "parentFileId",
                   version,
                   uploaded_at as "uploadedAt"
            FROM files
            WHERE id = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    static async findPersonalFiles(userId) {
        const sql = `
            SELECT id,
                   user_id as "userId",
                   class_id as "classId",
                   file_name as "fileName",
                   stored_name as "storedName",
                   file_path as "filePath",
                   file_size as "fileSize",
                   mime_type as "fileType",
                   visibility_role as "visibilityRole",
                   requires_signature as "requiresSignature",
                   parent_file_id as "parentFileId",
                   version,
                   uploaded_at as "uploadedAt"
            FROM files
            WHERE user_id = $1 AND class_id IS NULL
            ORDER BY uploaded_at DESC
        `;
        const result = await query(sql, [userId]);
        return result.rows;
    }

    static async findClassFiles(classId) {
        const sql = `
            SELECT id,
                   user_id as "userId",
                   class_id as "classId",
                   file_name as "fileName",
                   stored_name as "storedName",
                   file_path as "filePath",
                   file_size as "fileSize",
                   mime_type as "fileType",
                   visibility_role as "visibilityRole",
                   requires_signature as "requiresSignature",
                   parent_file_id as "parentFileId",
                   version,
                   uploaded_at as "uploadedAt"
            FROM files
            WHERE class_id = $1
            ORDER BY uploaded_at DESC
        `;
        const result = await query(sql, [classId]);
        return result.rows;
    }

    static async findSharedByRole(role) {
        const sql = `
            SELECT id,
                   user_id as "userId",
                   class_id as "classId",
                   file_name as "fileName",
                   stored_name as "storedName",
                   file_path as "filePath",
                   file_size as "fileSize",
                   mime_type as "fileType",
                   visibility_role as "visibilityRole",
                   requires_signature as "requiresSignature",
                   parent_file_id as "parentFileId",
                   version,
                   uploaded_at as "uploadedAt"
            FROM files
            WHERE visibility_role = $1
            ORDER BY uploaded_at DESC
        `;
        const result = await query(sql, [role]);
        return result.rows;
    }

    static async delete(id) {
        await query('DELETE FROM files WHERE id = $1', [id]);
    }
}

module.exports = FileModel;
