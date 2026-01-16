const { query } = require('../config/database');

// Normalise une ligne SQL vers le format utilisA� par l'API, avec valeurs par dA�faut si les colonnes sont absentes
const mapRowToFile = (row) => ({
    id: row.id,
    userId: row.user_id,
    classId: row.class_id,
    fileName: row.file_name,
    storedName: row.stored_name,
    filePath: row.file_path,
    fileSize: row.file_size,
    fileType: row.mime_type,
    visibilityRole: row.visibility_role || null,
    requiresSignature: row.requires_signature || false,
    parentFileId: row.parent_file_id || null,
    version: row.version || 1,
    uploadedAt: row.uploaded_at
});

class FileModel {
    // Insertion minimale pour rester compatible avec les schA�mas plus anciens (colonnes optionnelles non exigA�es)
    static async create({
        userId,
        classId,
        fileName,
        storedName,
        filePath,
        fileSize,
        mimeType,
        visibilityRole = null,
        requiresSignature = false,
        parentFileId = null,
        version = 1
    }) {
        const baseValues = [userId, classId || null, fileName, storedName, filePath, fileSize, mimeType];
        const safeVersion = version ?? 1;

        try {
            const sql = `
                INSERT INTO files (
                    user_id,
                    class_id,
                    file_name,
                    stored_name,
                    file_path,
                    file_size,
                    mime_type,
                    visibility_role,
                    requires_signature,
                    version,
                    parent_file_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `;
            const result = await query(sql, [
                ...baseValues,
                visibilityRole || null,
                !!requiresSignature,
                safeVersion,
                parentFileId || null
            ]);
            return mapRowToFile(result.rows[0]);
        } catch (err) {
            if (err.code && err.code !== '42703') {
                throw err;
            }
            const fallbackSql = `
                INSERT INTO files (user_id, class_id, file_name, stored_name, file_path, file_size, mime_type)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const result = await query(fallbackSql, baseValues);
            return mapRowToFile(result.rows[0]);
        }
    }

    static async findById(id) {
        const sql = `SELECT * FROM files WHERE id = $1`;
        const result = await query(sql, [id]);
        return result.rows[0] ? mapRowToFile(result.rows[0]) : null;
    }

    static async findPersonalFiles(userId) {
        const sql = `
            SELECT *
            FROM files
            WHERE user_id = $1 AND class_id IS NULL
            ORDER BY uploaded_at DESC
        `;
        const result = await query(sql, [userId]);
        return result.rows.map(mapRowToFile);
    }

    static async findClassFiles(classId) {
        const sql = `
            SELECT *
            FROM files
            WHERE class_id = $1
            ORDER BY uploaded_at DESC
        `;
        const result = await query(sql, [classId]);
        return result.rows.map(mapRowToFile);
    }

    static async findSharedByRole(role) {
        // On filtre par visibility_role si la colonne existe; sinon on renvoie tout.
        try {
            const filtered = await query(
                `
                SELECT *
                FROM files
                WHERE visibility_role = $1
                ORDER BY uploaded_at DESC
                `,
                [role]
            );
            return filtered.rows.map(mapRowToFile);
        } catch (err) {
            if (err.code && err.code !== '42703') {
                throw err;
            }
            const fallback = await query(`SELECT * FROM files ORDER BY uploaded_at DESC`);
            return fallback.rows.map(mapRowToFile);
        }
    }

    static async delete(id) {
        await query('DELETE FROM files WHERE id = $1', [id]);
    }
}

module.exports = FileModel;
