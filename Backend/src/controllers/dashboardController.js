const { query } = require('../config/database');
const User = require('../models/User');
const { ERROR_MESSAGES, USER_ROLES } = require('../config/constants');

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }

        if ([USER_ROLES.ALTERNANT, USER_ROLES.ETUDIANT_CLASSIQUE].includes(user.role)) {
            const journalSql = `
                SELECT
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'SUBMITTED' THEN 1 END) as pending,
                    COUNT(CASE WHEN status = 'VALIDATED' THEN 1 END) as validated
                FROM journals
                WHERE user_id = $1
            `;
            const journalRes = await query(journalSql, [userId]);

            const submissionSql = `
                SELECT
                    COUNT(*) as uploaded,
                    COUNT(CASE WHEN status = 'SUBMITTED' THEN 1 END) as pendingReview
                FROM requirement_submissions
                WHERE user_id = $1
            `;
            const submissionRes = await query(submissionSql, [userId]);

            let nextSoutenance = null;
            if (user.class_id) {
                const soutenanceSql = `
                    SELECT scheduled_at as "scheduledAt"
                    FROM soutenances
                    WHERE student_id = $1 AND scheduled_at > NOW()
                    ORDER BY scheduled_at ASC
                    LIMIT 1
                `;
                const sRes = await query(soutenanceSql, [userId]);
                nextSoutenance = sRes.rows[0]?.scheduledAt || null;
            }

            return res.json({
                success: true,
                data: {
                    journals: journalRes.rows[0],
                    documents: submissionRes.rows[0],
                    nextSoutenance
                }
            });
        }

        // Admin / encadrants
        const usersCount = await query('SELECT COUNT(*)::int as total FROM users WHERE is_active = true');
        const classesCount = await query('SELECT COUNT(*)::int as total FROM classes WHERE is_active = true');
        const requirementsCount = await query('SELECT COUNT(*)::int as total FROM requirements');
        const submissionsCount = await query('SELECT COUNT(*)::int as total FROM requirement_submissions');

        return res.json({
            success: true,
            data: {
                users: usersCount.rows[0]?.total || 0,
                classes: classesCount.rows[0]?.total || 0,
                requirements: requirementsCount.rows[0]?.total || 0,
                submissions: submissionsCount.rows[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des stats dashboard:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

module.exports = {
    getDashboardStats
};
