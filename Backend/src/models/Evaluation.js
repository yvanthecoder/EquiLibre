const { query } = require('../config/database');

class Evaluation {
    static async create({ studentId, evaluatorId, contextType, contextId, gridId, comment, scores }) {
        let overallScore = null;
        if (scores && scores.length > 0) {
            const criteriaIds = scores.map((s) => s.criteriaId);
            const criteriaSql = `
                SELECT id, max_score as "maxScore", weight
                FROM evaluation_criteria
                WHERE id = ANY($1)
            `;
            const criteriaResult = await query(criteriaSql, [criteriaIds]);
            const criteriaMap = new Map(criteriaResult.rows.map((row) => [row.id, row]));

            let weightedSum = 0;
            let weightTotal = 0;
            scores.forEach((s) => {
                const crit = criteriaMap.get(s.criteriaId);
                if (!crit) return;
                const normalized = crit.maxScore ? (s.score / crit.maxScore) : 0;
                weightedSum += normalized * (crit.weight || 1);
                weightTotal += (crit.weight || 1);
            });
            if (weightTotal > 0) {
                overallScore = Number(((weightedSum / weightTotal) * 20).toFixed(2));
            }
        }

        const evalSql = `
            INSERT INTO evaluations (student_id, evaluator_id, context_type, context_id, grid_id, overall_score, comment, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
            RETURNING id, student_id as "studentId", evaluator_id as "evaluatorId",
                      context_type as "contextType", context_id as "contextId", grid_id as "gridId",
                      overall_score as "overallScore", comment, status,
                      validated_by as "validatedBy", validated_at as "validatedAt",
                      created_at as "createdAt", updated_at as "updatedAt"
        `;
        const evalValues = [studentId, evaluatorId, contextType, contextId, gridId || null, overallScore, comment || null];
        const evalResult = await query(evalSql, evalValues);
        const evaluation = evalResult.rows[0];

        if (scores && scores.length > 0) {
            for (const s of scores) {
                const scoreSql = `
                    INSERT INTO evaluation_scores (evaluation_id, criteria_id, score, comment)
                    VALUES ($1, $2, $3, $4)
                `;
                await query(scoreSql, [evaluation.id, s.criteriaId, s.score, s.comment || null]);
            }
        }

        return evaluation;
    }

    static async findByStudentId(studentId) {
        const sql = `
            SELECT id, student_id as "studentId", evaluator_id as "evaluatorId",
                   context_type as "contextType", context_id as "contextId", grid_id as "gridId",
                   overall_score as "overallScore", comment, status,
                   validated_by as "validatedBy", validated_at as "validatedAt",
                   created_at as "createdAt", updated_at as "updatedAt",
                   v.firstname as "evaluatorFirstName", v.lastname as "evaluatorLastName", v.role as "evaluatorRole",
                   CASE
                       WHEN context_type = 'REQUIREMENT' THEN r.title
                       WHEN context_type = 'JOURNAL' THEN
                           CASE
                               WHEN j.period_start IS NOT NULL AND j.period_end IS NOT NULL THEN
                                   'Journal ' || to_char(j.period_start, 'YYYY-MM-DD') || ' - ' || to_char(j.period_end, 'YYYY-MM-DD')
                               ELSE 'Journal'
                           END
                       WHEN context_type = 'SOUTENANCE' THEN s.title
                       ELSE NULL
                   END as "contextLabel"
            FROM evaluations
            LEFT JOIN users v ON v.id = evaluations.evaluator_id
            LEFT JOIN requirements r ON evaluations.context_type = 'REQUIREMENT' AND r.id = evaluations.context_id
            LEFT JOIN journals j ON evaluations.context_type = 'JOURNAL' AND j.id = evaluations.context_id
            LEFT JOIN soutenances s ON evaluations.context_type = 'SOUTENANCE' AND s.id = evaluations.context_id
            WHERE student_id = $1
            ORDER BY created_at DESC
        `;
        const result = await query(sql, [studentId]);
        return result.rows;
    }

    static async findByContext(contextType, contextId) {
        const sql = `
            SELECT id, student_id as "studentId", evaluator_id as "evaluatorId",
                   context_type as "contextType", context_id as "contextId", grid_id as "gridId",
                   overall_score as "overallScore", comment, status,
                   validated_by as "validatedBy", validated_at as "validatedAt",
                   created_at as "createdAt", updated_at as "updatedAt",
                   v.firstname as "evaluatorFirstName", v.lastname as "evaluatorLastName", v.role as "evaluatorRole",
                   CASE
                       WHEN context_type = 'REQUIREMENT' THEN r.title
                       WHEN context_type = 'JOURNAL' THEN
                           CASE
                               WHEN j.period_start IS NOT NULL AND j.period_end IS NOT NULL THEN
                                   'Journal ' || to_char(j.period_start, 'YYYY-MM-DD') || ' - ' || to_char(j.period_end, 'YYYY-MM-DD')
                               ELSE 'Journal'
                           END
                       WHEN context_type = 'SOUTENANCE' THEN s.title
                       ELSE NULL
                   END as "contextLabel"
            FROM evaluations
            LEFT JOIN users v ON v.id = evaluations.evaluator_id
            LEFT JOIN requirements r ON evaluations.context_type = 'REQUIREMENT' AND r.id = evaluations.context_id
            LEFT JOIN journals j ON evaluations.context_type = 'JOURNAL' AND j.id = evaluations.context_id
            LEFT JOIN soutenances s ON evaluations.context_type = 'SOUTENANCE' AND s.id = evaluations.context_id
            WHERE context_type = $1 AND context_id = $2
            ORDER BY created_at DESC
        `;
        const result = await query(sql, [contextType, contextId]);
        return result.rows;
    }

    static async findScores(evaluationId) {
        const sql = `
            SELECT id, evaluation_id as "evaluationId", criteria_id as "criteriaId", score, comment
            FROM evaluation_scores
            WHERE evaluation_id = $1
        `;
        const result = await query(sql, [evaluationId]);
        return result.rows;
    }

    static async findAll({ status } = {}) {
        const filters = [];
        const values = [];
        if (status) {
            values.push(status);
            filters.push(`e.status = $${values.length}`);
        }
        const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
        const sql = `
            SELECT e.id, e.student_id as "studentId", e.evaluator_id as "evaluatorId",
                   e.context_type as "contextType", e.context_id as "contextId", e.grid_id as "gridId",
                   e.overall_score as "overallScore", e.comment, e.status,
                   e.validated_by as "validatedBy", e.validated_at as "validatedAt",
                   e.created_at as "createdAt", e.updated_at as "updatedAt",
                   s.firstname as student_firstname, s.lastname as student_lastname,
                   v.firstname as evaluator_firstname, v.lastname as evaluator_lastname, v.role as evaluator_role,
                   CASE
                       WHEN e.context_type = 'REQUIREMENT' THEN r.title
                       WHEN e.context_type = 'JOURNAL' THEN
                           CASE
                               WHEN j.period_start IS NOT NULL AND j.period_end IS NOT NULL THEN
                                   'Journal ' || to_char(j.period_start, 'YYYY-MM-DD') || ' - ' || to_char(j.period_end, 'YYYY-MM-DD')
                               ELSE 'Journal'
                           END
                       WHEN e.context_type = 'SOUTENANCE' THEN so.title
                       ELSE NULL
                   END as context_label
            FROM evaluations e
            LEFT JOIN users s ON s.id = e.student_id
            LEFT JOIN users v ON v.id = e.evaluator_id
            LEFT JOIN requirements r ON e.context_type = 'REQUIREMENT' AND r.id = e.context_id
            LEFT JOIN journals j ON e.context_type = 'JOURNAL' AND j.id = e.context_id
            LEFT JOIN soutenances so ON e.context_type = 'SOUTENANCE' AND so.id = e.context_id
            ${whereClause}
            ORDER BY e.created_at DESC
        `;
        const result = await query(sql, values);
        return result.rows;
    }

    static async findByStudentAndContext(studentId, contextType, contextId, status) {
        const filters = ['student_id = $1', 'context_type = $2', 'context_id = $3'];
        const values = [studentId, contextType, contextId];
        if (status) {
            values.push(status);
            filters.push(`status = $${values.length}`);
        }
        const sql = `
            SELECT e.id, e.student_id as "studentId", e.evaluator_id as "evaluatorId",
                   e.context_type as "contextType", e.context_id as "contextId", e.grid_id as "gridId",
                   e.overall_score as "overallScore", e.comment, e.status,
                   e.validated_by as "validatedBy", e.validated_at as "validatedAt",
                   e.created_at as "createdAt", e.updated_at as "updatedAt",
                   v.firstname as "evaluatorFirstName", v.lastname as "evaluatorLastName", v.role as "evaluatorRole",
                   CASE
                       WHEN e.context_type = 'REQUIREMENT' THEN r.title
                       WHEN e.context_type = 'JOURNAL' THEN
                           CASE
                               WHEN j.period_start IS NOT NULL AND j.period_end IS NOT NULL THEN
                                   'Journal ' || to_char(j.period_start, 'YYYY-MM-DD') || ' - ' || to_char(j.period_end, 'YYYY-MM-DD')
                               ELSE 'Journal'
                           END
                       WHEN e.context_type = 'SOUTENANCE' THEN s.title
                       ELSE NULL
                   END as "contextLabel"
            FROM evaluations e
            LEFT JOIN users v ON v.id = e.evaluator_id
            LEFT JOIN requirements r ON e.context_type = 'REQUIREMENT' AND r.id = e.context_id
            LEFT JOIN journals j ON e.context_type = 'JOURNAL' AND j.id = e.context_id
            LEFT JOIN soutenances s ON e.context_type = 'SOUTENANCE' AND s.id = e.context_id
            WHERE ${filters.join(' AND ')}
            ORDER BY e.created_at DESC
        `;
        const result = await query(sql, values);
        return result.rows;
    }

    static async findExistingEvaluation({ studentId, evaluatorId, contextType, contextId }) {
        const sql = `
            SELECT id, status
            FROM evaluations
            WHERE student_id = $1
              AND evaluator_id = $2
              AND context_type = $3
              AND context_id = $4
            LIMIT 1
        `;
        const result = await query(sql, [studentId, evaluatorId, contextType, contextId]);
        return result.rows[0];
    }

    static async updateGroupStatus(studentId, contextType, contextId, status, validatorId) {
        const sql = `
            UPDATE evaluations
            SET status = $1,
                validated_by = $2,
                validated_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE student_id = $3
              AND context_type = $4
              AND context_id = $5
              AND status = 'PENDING'
            RETURNING id, student_id as "studentId", evaluator_id as "evaluatorId",
                      context_type as "contextType", context_id as "contextId", grid_id as "gridId",
                      overall_score as "overallScore", comment, status,
                      validated_by as "validatedBy", validated_at as "validatedAt",
                      created_at as "createdAt", updated_at as "updatedAt"
        `;
        const result = await query(sql, [status, validatorId, studentId, contextType, contextId]);
        return result.rows;
    }

    static async updateStatus(evaluationId, status, validatorId) {
        const sql = `
            UPDATE evaluations
            SET status = $1,
                validated_by = $2,
                validated_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, student_id as "studentId", evaluator_id as "evaluatorId",
                      context_type as "contextType", context_id as "contextId", grid_id as "gridId",
                      overall_score as "overallScore", comment, status,
                      validated_by as "validatedBy", validated_at as "validatedAt",
                      created_at as "createdAt", updated_at as "updatedAt"
        `;
        const result = await query(sql, [status, validatorId, evaluationId]);
        return result.rows[0];
    }
}

module.exports = Evaluation;
