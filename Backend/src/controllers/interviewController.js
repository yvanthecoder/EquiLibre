const Interview = require('../models/Interview');
const Assignment = require('../models/Assignment');
const { ERROR_MESSAGES, USER_ROLES } = require('../config/constants');
const { createNotification } = require('../utils/notifications');

const getInterviews = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.userId;
        let interviews = [];

        if (role === USER_ROLES.ADMIN) {
            interviews = await Interview.findAll();
        } else if (role === USER_ROLES.TUTEUR_ECOLE) {
            interviews = await Interview.findByTuteurId(userId);
        } else if (role === USER_ROLES.MAITRE_APP) {
            interviews = await Interview.findByMaitreId(userId);
        } else {
            interviews = await Interview.findByStudentId(userId);
        }

        return res.json({ success: true, data: interviews });
    } catch (error) {
        console.error('Erreur lors de la récupération des entretiens:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const getInterviewById = async (req, res) => {
    try {
        const interviewId = parseInt(req.params.id, 10);
        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }

        const userId = req.user.userId;
        const role = req.user.role;
        const isOwner = [interview.studentId, interview.tuteurId, interview.maitreId].includes(userId);
        const isAdmin = role === USER_ROLES.ADMIN;

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: ERROR_MESSAGES.FORBIDDEN });
        }

        return res.json({ success: true, data: interview });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'entretien:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const createInterview = async (req, res) => {
    try {
        const role = req.user.role;
        const { studentId, tuteurId, maitreId, scheduledAt, location, status, summary } = req.body;
        const requestedStudentId = Number(studentId);
        if (!requestedStudentId || !scheduledAt) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }

        if ([USER_ROLES.ALTERNANT, USER_ROLES.ETUDIANT_CLASSIQUE].includes(role) && requestedStudentId !== req.user.userId) {
            return res.status(403).json({ success: false, message: ERROR_MESSAGES.FORBIDDEN });
        }

        let resolvedTuteurId = tuteurId;
        let resolvedMaitreId = maitreId;
        let resolvedStatus = status;

        if ([USER_ROLES.ALTERNANT, USER_ROLES.ETUDIANT_CLASSIQUE].includes(role)) {
            resolvedStatus = 'PROPOSED';
            const assignment = await Assignment.findByStudentId(req.user.userId);
            if (!resolvedTuteurId && assignment?.tuteur_id) {
                resolvedTuteurId = assignment.tuteur_id;
            }
            if (!resolvedMaitreId && assignment?.maitre_id) {
                resolvedMaitreId = assignment.maitre_id;
            }
        }

        const interview = await Interview.create({
            studentId: requestedStudentId,
            tuteurId: resolvedTuteurId,
            maitreId: resolvedMaitreId,
            scheduledAt,
            location,
            status: resolvedStatus,
            summary,
            createdBy: req.user.userId
        });

        try {
            if ([USER_ROLES.ALTERNANT, USER_ROLES.ETUDIANT_CLASSIQUE].includes(role)) {
                const recipients = new Set();
                if (resolvedTuteurId) recipients.add(resolvedTuteurId);
                if (resolvedMaitreId) recipients.add(resolvedMaitreId);
                for (const recipientId of recipients) {
                    await createNotification({
                        userId: recipientId,
                        title: 'Entretien proposé',
                        message: 'Un étudiant a proposé un créneau pour un entretien semestriel.',
                        type: 'INFO',
                        link: '/interviews'
                    });
                }
            } else {
                await createNotification({
                    userId: studentId,
                    title: 'Entretien planifié',
                    message: 'Un entretien semestriel a été planifié.',
                    type: 'INFO',
                    link: '/interviews'
                });
            }
        } catch (notifyError) {
            console.warn('Notification entretien échouée:', notifyError.message);
        }

        return res.status(201).json({ success: true, data: interview });
    } catch (error) {
        const message = error?.message || '';
        if (message.includes('interview_status') && message.includes('invalid input value for enum')) {
            return res.status(400).json({
                success: false,
                message: "Statut PROPOSED non supporte en base. Executez: ALTER TYPE interview_status ADD VALUE IF NOT EXISTS 'PROPOSED';"
            });
        }
        console.error('Erreur lors de la creation de l\'entretien:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};


const updateInterview = async (req, res) => {
    try {
        const interviewId = parseInt(req.params.id, 10);
        const existing = await Interview.findById(interviewId);
        if (!existing) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }

        const updates = {};
        if (req.body.studentId !== undefined) updates.student_id = req.body.studentId;
        if (req.body.tuteurId !== undefined) updates.tuteur_id = req.body.tuteurId;
        if (req.body.maitreId !== undefined) updates.maitre_id = req.body.maitreId;
        if (req.body.scheduledAt !== undefined) updates.scheduled_at = req.body.scheduledAt;
        if (req.body.location !== undefined) updates.location = req.body.location;
        if (req.body.status !== undefined) updates.status = req.body.status;
        if (req.body.summary !== undefined) updates.summary = req.body.summary;

        const updated = await Interview.update(interviewId, updates);
        return res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'entretien:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const deleteInterview = async (req, res) => {
    try {
        const interviewId = parseInt(req.params.id, 10);
        await Interview.delete(interviewId);
        return res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'entretien:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

module.exports = {
    getInterviews,
    getInterviewById,
    createInterview,
    updateInterview,
    deleteInterview
};
