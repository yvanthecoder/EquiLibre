const Journal = require('../models/Journal');
const User = require('../models/User');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const { ERROR_MESSAGES, USER_ROLES } = require('../config/constants');
const { createNotification } = require('../utils/notifications');

const isValidPeriod = (periodStart, periodEnd) => {
    if (!periodStart || !periodEnd) {
        return true;
    }
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return false;
    }
    return startDate < endDate;
};

const getMyJournals = async (req, res) => {
    try {
        const journals = await Journal.findByUserId(req.user.userId);
        return res.json({ success: true, data: journals });
    } catch (error) {
        console.error('Erreur lors de la récupération des journaux:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const getJournalById = async (req, res) => {
    try {
        const journalId = parseInt(req.params.id, 10);
        const journal = await Journal.findById(journalId);
        if (!journal) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }

        const isOwner = journal.userId === req.user.userId;
        const isStaff = [USER_ROLES.ADMIN, USER_ROLES.TUTEUR_ECOLE, USER_ROLES.MAITRE_APP].includes(req.user.role);
        if (!isOwner && !isStaff) {
            return res.status(403).json({ success: false, message: ERROR_MESSAGES.FORBIDDEN });
        }

        return res.json({ success: true, data: journal });
    } catch (error) {
        console.error('Erreur lors de la récupération du journal:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const createJournal = async (req, res) => {
    try {
        const { periodStart, periodEnd, content, status } = req.body;
        if (!isValidPeriod(periodStart, periodEnd)) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'La date de debut doit etre inferieure a la date de fin'
            });
        }
        const journal = await Journal.create({
            userId: req.user.userId,
            periodStart,
            periodEnd,
            content,
            status
        });
        return res.status(201).json({ success: true, data: journal });
    } catch (error) {
        console.error('Erreur lors de la création du journal:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const updateJournal = async (req, res) => {
    try {
        const journalId = parseInt(req.params.id, 10);
        const journal = await Journal.findById(journalId);
        if (!journal) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }

        if (journal.userId !== req.user.userId) {
            return res.status(403).json({ success: false, message: ERROR_MESSAGES.FORBIDDEN });
        }

        const nextPeriodStart = req.body.periodStart !== undefined ? req.body.periodStart : journal.periodStart;
        const nextPeriodEnd = req.body.periodEnd !== undefined ? req.body.periodEnd : journal.periodEnd;
        if (!isValidPeriod(nextPeriodStart, nextPeriodEnd)) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'La date de debut doit etre inferieure a la date de fin'
            });
        }

        const updates = {};
        if (req.body.periodStart !== undefined) updates.period_start = req.body.periodStart;
        if (req.body.periodEnd !== undefined) updates.period_end = req.body.periodEnd;
        if (req.body.content !== undefined) updates.content = req.body.content;
        if (req.body.status !== undefined) updates.status = req.body.status;

        const updated = await Journal.update(journalId, updates);
        return res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du journal:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const submitJournal = async (req, res) => {
    try {
        const journalId = parseInt(req.params.id, 10);
        const journal = await Journal.findById(journalId);
        if (!journal) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }
        if (journal.userId !== req.user.userId) {
            return res.status(403).json({ success: false, message: ERROR_MESSAGES.FORBIDDEN });
        }
        if (!isValidPeriod(journal.periodStart, journal.periodEnd)) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'La date de debut doit etre inferieure a la date de fin'
            });
        }
        const updated = await Journal.update(journalId, { status: 'SUBMITTED' });
        try {
            const user = await User.findById(req.user.userId);
            const recipients = new Set();

            if (user?.class_id) {
                const classData = await Class.findById(user.class_id);
                if (classData?.tuteur_id) {
                    recipients.add(classData.tuteur_id);
                }
            }

            const assignment = await Assignment.findByStudentId(req.user.userId);
            if (assignment?.tuteur_id) recipients.add(assignment.tuteur_id);
            if (assignment?.maitre_id) recipients.add(assignment.maitre_id);

            for (const userId of recipients) {
                await createNotification({
                    userId,
                    title: 'Journal soumis',
                    message: 'Un journal de formation est en attente de validation.',
                    type: 'INFO',
                    link: `/journals`
                });
            }
        } catch (notifyError) {
            console.warn('Notification journal soumission échouée:', notifyError.message);
        }
        return res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Erreur lors de la soumission du journal:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const validateJournal = async (req, res) => {
    try {
        const journalId = parseInt(req.params.id, 10);
        const { status, comment } = req.body;
        if (!status || !['VALIDATED', 'ARCHIVED'].includes(status)) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }
        const updated = await Journal.update(journalId, {
            status,
            validation_comment: comment || null,
            validated_by: req.user.userId,
            validated_at: new Date().toISOString()
        });
        if (updated?.userId) {
            try {
                await createNotification({
                    userId: updated.userId,
                    title: 'Journal validé',
                    message: status === 'VALIDATED' ? 'Votre journal a été validé.' : 'Votre journal a été archivé.',
                    type: status === 'VALIDATED' ? 'SUCCESS' : 'INFO',
                    link: `/journals`
                });
            } catch (notifyError) {
                console.warn('Notification journal validation échouée:', notifyError.message);
            }
        }
        return res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Erreur lors de la validation du journal:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const getClassJournals = async (req, res) => {
    try {
        const classId = parseInt(req.params.classId, 10);
        const journals = await Journal.findByClassId(classId);
        return res.json({ success: true, data: journals });
    } catch (error) {
        console.error('Erreur lors de la récupération des journaux de classe:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

module.exports = {
    getMyJournals,
    getJournalById,
    createJournal,
    updateJournal,
    submitJournal,
    validateJournal,
    getClassJournals
};
