const Evaluation = require('../models/Evaluation');
const Assignment = require('../models/Assignment');
const RequirementSubmission = require('../models/RequirementSubmission');
const { ERROR_MESSAGES, USER_ROLES } = require('../config/constants');
const { createNotification } = require('../utils/notifications');

const createEvaluation = async (req, res) => {
    try {
        const { studentId, contextType, contextId, gridId, comment, scores } = req.body;
        if (!studentId || !contextType || !contextId) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }
        const parsedStudentId = parseInt(studentId, 10);
        const parsedContextId = parseInt(contextId, 10);
        if (Number.isNaN(parsedStudentId) || Number.isNaN(parsedContextId)) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }
        if ([USER_ROLES.JURY, USER_ROLES.INTERVENANT].includes(req.user.role)) {
            if (!['SOUTENANCE', 'REQUIREMENT'].includes(contextType)) {
                return res.status(403).json({ success: false, message: ERROR_MESSAGES.FORBIDDEN });
            }
        }

        if (req.user.role === USER_ROLES.ADMIN) {
            return res.status(403).json({ success: false, message: ERROR_MESSAGES.FORBIDDEN });
        }
        if ([USER_ROLES.TUTEUR_ECOLE, USER_ROLES.MAITRE_APP].includes(req.user.role)) {
            const assignment = await Assignment.findByStudentId(parsedStudentId);
            const isTutorOwner = req.user.role === USER_ROLES.TUTEUR_ECOLE && assignment?.tuteur_id === req.user.userId;
            const isMaitreOwner = req.user.role === USER_ROLES.MAITRE_APP && assignment?.maitre_id === req.user.userId;
            if (!assignment || !(isTutorOwner || isMaitreOwner)) {
                return res.status(403).json({ success: false, message: ERROR_MESSAGES.FORBIDDEN });
            }
        }

        if (contextType === 'REQUIREMENT') {
            const submissions = await RequirementSubmission.findByRequirement(parsedContextId);
            const hasSubmission = submissions.some((sub) => sub.userId === parsedStudentId);
            if (!hasSubmission) {
                return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
            }
        }

        const existing = await Evaluation.findExistingEvaluation({
            studentId: parsedStudentId,
            evaluatorId: req.user.userId,
            contextType,
            contextId: parsedContextId
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'Evaluation deja soumise'
            });
        }

        const evaluation = await Evaluation.create({
            studentId: parsedStudentId,
            evaluatorId: req.user.userId,
            contextType,
            contextId: parsedContextId,
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

const getAllEvaluations = async (req, res) => {
    try {
        const status = req.query.status;
        const evaluations = await Evaluation.findAll({ status });
        return res.json({ success: true, data: evaluations });
    } catch (error) {
        console.error('Erreur lors de la recuperation des evaluations:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const validateEvaluation = async (req, res) => {
    try {
        const evaluationId = parseInt(req.params.id, 10);
        const { status } = req.body;
        if (!['VALIDATED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }
        const updated = await Evaluation.updateStatus(evaluationId, status, req.user.userId);
        try {
            if (updated?.studentId && status === 'VALIDATED') {
                await createNotification({
                    userId: updated.studentId,
                    title: 'Evaluation validee',
                    message: `Votre note a ete validee (${updated.contextType} #${updated.contextId}).`,
                    type: 'INFO',
                    link: '/soutenances'
                });
            }
        } catch (notifyError) {
            console.warn('Notification validation evaluation echouee:', notifyError.message);
        }
        return res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Erreur lors de la validation de l evaluation:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const validateEvaluationGroup = async (req, res) => {
    try {
        const { studentId, contextType, contextId, status } = req.body;
        if (!studentId || !contextType || !contextId || !status) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }
        if (!['VALIDATED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }

        const parsedStudentId = parseInt(studentId, 10);
        const parsedContextId = parseInt(contextId, 10);
        if (Number.isNaN(parsedStudentId) || Number.isNaN(parsedContextId)) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }

        const evaluations = await Evaluation.findByStudentAndContext(parsedStudentId, contextType, parsedContextId, 'PENDING');
        if (!evaluations || evaluations.length === 0) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }

        if (contextType === 'REQUIREMENT') {
            const hasTutor = evaluations.some((ev) => ev.evaluatorRole === USER_ROLES.TUTEUR_ECOLE);
            const hasMaitre = evaluations.some((ev) => ev.evaluatorRole === USER_ROLES.MAITRE_APP);
            if (!hasTutor || !hasMaitre) {
                return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
            }
        }

        const updated = await Evaluation.updateGroupStatus(
            parsedStudentId,
            contextType,
            parsedContextId,
            status,
            req.user.userId
        );

        let average = null;
        if (contextType === 'REQUIREMENT') {
            const relevant = evaluations.filter((ev) =>
                [USER_ROLES.TUTEUR_ECOLE, USER_ROLES.MAITRE_APP].includes(ev.evaluatorRole)
            );
            const scores = relevant
                .map((ev) => (ev.overallScore !== null && ev.overallScore !== undefined ? Number(ev.overallScore) : null))
                .filter((score) => !Number.isNaN(score) && score !== null);
            if (scores.length > 0) {
                average = Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(2));
            }
        }

        try {
            if (status === 'VALIDATED') {
                const label =
                    evaluations[0]?.contextLabel ||
                    (contextType === 'REQUIREMENT' ? `Rapport #${parsedContextId}` : `${contextType} #${parsedContextId}`);
                const message =
                    average !== null
                        ? `Votre note pour ${label} a ete validee. Moyenne: ${average}/20.`
                        : `Votre note pour ${label} a ete validee.`;
                await createNotification({
                    userId: parsedStudentId,
                    title: 'Note validee',
                    message,
                    type: 'INFO',
                    link: '/evaluations'
                });
            }
        } catch (notifyError) {
            console.warn('Notification validation groupe evaluation echouee:', notifyError.message);
        }

        return res.json({ success: true, data: { evaluations: updated, average } });
    } catch (error) {
        console.error('Erreur lors de la validation groupée des evaluations:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

module.exports = {
    createEvaluation,
    getStudentEvaluations,
    getContextEvaluations,
    getEvaluationScores,
    getAllEvaluations,
    validateEvaluation,
    validateEvaluationGroup
};
