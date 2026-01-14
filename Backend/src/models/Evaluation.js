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
            INSERT INTO evaluations (student_id, evaluator_id, context_type, context_id, grid_id, overall_score, comment)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, student_id as "studentId", evaluator_id as "evaluatorId",
                      context_type as "contextType", context_id as "contextId", grid_id as "gridId",
                      overall_score as "overallScore", comment, created_at as "createdAt", updated_at as "updatedAt"
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
                   overall_score as "overallScore", comment, created_at as "createdAt", updated_at as "updatedAt"
            FROM evaluations
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
                   overall_score as "overallScore", comment, created_at as "createdAt", updated_at as "updatedAt"
            FROM evaluations
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
}

module.exports = Evaluation;
