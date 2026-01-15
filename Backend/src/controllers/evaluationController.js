const Evaluation = require('../models/Evaluation');
const { ERROR_MESSAGES, USER_ROLES } = require('../config/constants');

const createEvaluation = async (req, res) => {
    try {
        const { studentId, contextType, contextId, gridId, comment, scores } = req.body;
        if (!studentId || !contextType || !contextId) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }

        const evaluation = await Evaluation.create({
            studentId: parseInt(studentId, 10),
            evaluatorId: req.user.userId,
            contextType,
            contextId: parseInt(contextId, 10),
            gridId: gridId ? parseInt(gridId, 10) : null,
            comment,
            scores
        });

        return res.status(201).json({ success: true, data: evaluation });
    } catch (error) {
        console.error('Erreur lors de la création de l\'évaluation:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const getStudentEvaluations = async (req, res) => {
    try {
        const studentId = parseInt(req.params.studentId, 10);
        const isOwner = req.user.userId === studentId;
        const isStaff = [USER_ROLES.ADMIN, USER_ROLES.TUTEUR_ECOLE, USER_ROLES.MAITRE_APP, USER_ROLES.JURY, USER_ROLES.INTERVENANT].includes(req.user.role);
        if (!isOwner && !isStaff) {
            return res.status(403).json({ success: false, message: ERROR_MESSAGES.FORBIDDEN });
        }
        const evaluations = await Evaluation.findByStudentId(studentId);
        return res.json({ success: true, data: evaluations });
    } catch (error) {
        console.error('Erreur lors de la récupération des évaluations:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const getContextEvaluations = async (req, res) => {
    try {
        const { contextType, contextId } = req.query;
        if (!contextType || !contextId) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }
        const evaluations = await Evaluation.findByContext(contextType, parseInt(contextId, 10));
        return res.json({ success: true, data: evaluations });
    } catch (error) {
        console.error('Erreur lors de la récupération des évaluations par contexte:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const getEvaluationScores = async (req, res) => {
    try {
        const evaluationId = parseInt(req.params.id, 10);
        const scores = await Evaluation.findScores(evaluationId);
        return res.json({ success: true, data: scores });
    } catch (error) {
        console.error('Erreur lors de la récupération des scores:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

module.exports = {
    createEvaluation,
    getStudentEvaluations,
    getContextEvaluations,
    getEvaluationScores
};
