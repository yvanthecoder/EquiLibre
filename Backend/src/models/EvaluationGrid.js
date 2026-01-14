const { query } = require('../config/database');

class EvaluationGrid {
    static async create({ name, description, createdBy, criteria }) {
        const gridSql = `
            INSERT INTO evaluation_grids (name, description, created_by)
            VALUES ($1, $2, $3)
            RETURNING id, name, description, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
        `;
        const gridResult = await query(gridSql, [name, description || null, createdBy || null]);
        const grid = gridResult.rows[0];

        if (criteria && Array.isArray(criteria) && criteria.length > 0) {
            for (const item of criteria) {
                const critSql = `
                    INSERT INTO evaluation_criteria (grid_id, label, max_score, weight)
                    VALUES ($1, $2, $3, $4)
                `;
                await query(critSql, [
                    grid.id,
                    item.label,
                    item.maxScore || 20,
                    item.weight || 1
                ]);
            }
        }

        return grid;
    }

    static async findAll() {
        const sql = `
            SELECT id, name, description, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
            FROM evaluation_grids
            ORDER BY created_at DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    static async findById(gridId) {
        const gridSql = `
            SELECT id, name, description, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
            FROM evaluation_grids
            WHERE id = $1
        `;
        const gridResult = await query(gridSql, [gridId]);
        const grid = gridResult.rows[0];
        if (!grid) return null;

        const criteriaSql = `
            SELECT id, grid_id as "gridId", label, max_score as "maxScore", weight
            FROM evaluation_criteria
            WHERE grid_id = $1
            ORDER BY id ASC
        `;
        const criteria = await query(criteriaSql, [gridId]);
        return { ...grid, criteria: criteria.rows };
    }

    static async update(gridId, updates) {
        const allowedFields = ['name', 'description'];
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

        values.push(gridId);
        const sql = `
            UPDATE evaluation_grids
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING id, name, description, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
        `;
        const result = await query(sql, values);
        return result.rows[0];
    }

    static async delete(gridId) {
        const sql = `DELETE FROM evaluation_grids WHERE id = $1`;
        await query(sql, [gridId]);
    }
}

module.exports = EvaluationGrid;
