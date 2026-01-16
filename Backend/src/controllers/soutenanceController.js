const Soutenance = require('../models/Soutenance');
const { ERROR_MESSAGES, USER_ROLES } = require('../config/constants');
const { createNotification } = require('../utils/notifications');

const getSoutenances = async (req, res) => {
    try {
        const role = req.user.role;
        let data = [];
        if (role === USER_ROLES.ADMIN) {
            const classId = req.query.classId ? parseInt(req.query.classId, 10) : null;
            const studentId = req.query.studentId ? parseInt(req.query.studentId, 10) : null;
            if (studentId) {
                data = await Soutenance.findByStudentId(studentId);
            } else if (classId) {
                data = await Soutenance.findByClassId(classId);
            } else {
                data = await Soutenance.findAll();
            }
        } else {
            data = await Soutenance.findForUser(req.user.userId);
        }
        return res.json({ success: true, data });
    } catch (error) {
        console.error('Erreur lors de la récupération des soutenances:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const getSoutenanceById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const soutenance = await Soutenance.findById(id);
        if (!soutenance) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }
        return res.json({ success: true, data: soutenance });
    } catch (error) {
        console.error('Erreur lors de la récupération de la soutenance:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const createSoutenance = async (req, res) => {
    try {
        const { studentId, title, scheduledAt, location, status } = req.body;
        if (!studentId || !title || !scheduledAt) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }
        const soutenance = await Soutenance.create({
            studentId: parseInt(studentId, 10),
            title,
            scheduledAt,
            location,
            status,
            createdBy: req.user.userId
        });
        try {
            await createNotification({
                userId: soutenance.studentId,
                title: 'Soutenance planifiée',
                message: `Soutenance prévue: ${title}`,
                type: 'INFO',
                link: '/soutenances'
            });
        } catch (notifyError) {
            console.warn('Notification soutenance échouée:', notifyError.message);
        }
        return res.status(201).json({ success: true, data: soutenance });
    } catch (error) {
        console.error('Erreur lors de la création de la soutenance:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const updateSoutenance = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existing = await Soutenance.findById(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }
        const updates = {};
        if (req.body.studentId !== undefined) updates.student_id = parseInt(req.body.studentId, 10);
        if (req.body.title !== undefined) updates.title = req.body.title;
        if (req.body.scheduledAt !== undefined) updates.scheduled_at = req.body.scheduledAt;
        if (req.body.location !== undefined) updates.location = req.body.location;
        if (req.body.status !== undefined) updates.status = req.body.status;

        const updated = await Soutenance.update(id, updates);
        const newScheduledAt = req.body.scheduledAt;
        const isDateChanged = newScheduledAt && newScheduledAt !== existing.scheduledAt;
        if (isDateChanged) {
            try {
                const jury = await Soutenance.listJury(id);
                const recipients = new Set();
                if (updated.studentId) recipients.add(updated.studentId);
                jury.forEach((member) => recipients.add(member.id));
                const studentLabel = updated.studentFirstName && updated.studentLastName
                    ? `${updated.studentFirstName} ${updated.studentLastName}`
                    : `Etudiant #${updated.studentId}`;
                const formattedDate = new Date(updated.scheduledAt).toLocaleString('fr-FR', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                });
                for (const userId of recipients) {
                    await createNotification({
                        userId,
                        title: "Soutenance replanifiee",
                        message: `La soutenance de ${studentLabel} a ete replanifiee au ${formattedDate}.`,
                        type: "INFO",
                        link: "/soutenances"
                    });
                }
            } catch (notifyError) {
                console.warn("Notification soutenance replanifiee echouee:", notifyError.message);
            }
        }
        return res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la soutenance:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const deleteSoutenance = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await Soutenance.delete(id);
        return res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression de la soutenance:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const addJuryMember = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }
        const row = await Soutenance.addJury(id, parseInt(userId, 10));
        try {
            const soutenance = await Soutenance.findById(id);
            if (soutenance) {
                const studentLabel = soutenance.studentFirstName && soutenance.studentLastName
                    ? `${soutenance.studentFirstName} ${soutenance.studentLastName}`
                    : `Etudiant #${soutenance.studentId}`;
                await createNotification({
                    userId: parseInt(userId, 10),
                    title: 'Affectation jury',
                    message: `Vous etes assigne a la soutenance de ${studentLabel}.`,
                    type: 'INFO',
                    link: '/soutenances'
                });
            }
        } catch (notifyError) {
            console.warn('Notification jury echouee:', notifyError.message);
        }
        return res.status(201).json({ success: true, data: row });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du jury:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const removeJuryMember = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = parseInt(req.params.userId, 10);
        await Soutenance.removeJury(id, userId);
        return res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression du jury:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const listJury = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const jury = await Soutenance.listJury(id);
        return res.json({ success: true, data: jury });
    } catch (error) {
        console.error('Erreur lors de la récupération du jury:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

module.exports = {
    getSoutenances,
    getSoutenanceById,
    createSoutenance,
    updateSoutenance,
    deleteSoutenance,
    addJuryMember,
    removeJuryMember,
    listJury
};
