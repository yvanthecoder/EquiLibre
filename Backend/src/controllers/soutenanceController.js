const Soutenance = require('../models/Soutenance');
const { ERROR_MESSAGES, USER_ROLES } = require('../config/constants');
const { createNotification } = require('../utils/notifications');
const { query } = require('../config/database');

const getSoutenances = async (req, res) => {
    try {
        const role = req.user.role;
        let data = [];
        if (role === USER_ROLES.ADMIN) {
            const classId = req.query.classId ? parseInt(req.query.classId, 10) : null;
            if (classId) {
                data = await Soutenance.findByClassId(classId);
            } else {
                // Admin doit préciser classId pour éviter de charger toutes les classes
                data = [];
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
        const { classId, title, scheduledAt, location, status } = req.body;
        if (!classId || !title || !scheduledAt) {
            return res.status(400).json({ success: false, message: ERROR_MESSAGES.BAD_REQUEST });
        }
        const soutenance = await Soutenance.create({
            classId: parseInt(classId, 10),
            title,
            scheduledAt,
            location,
            status,
            createdBy: req.user.userId
        });
        try {
            const members = await query('SELECT user_id FROM class_members WHERE class_id = $1', [classId]);
            for (const row of members.rows) {
                await createNotification({
                    userId: row.user_id,
                    title: 'Soutenance planifiée',
                    message: `Nouvelle soutenance: ${title}`,
                    type: 'INFO',
                    link: '/soutenances'
                });
            }
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
        const updates = {};
        if (req.body.classId !== undefined) updates.class_id = parseInt(req.body.classId, 10);
        if (req.body.title !== undefined) updates.title = req.body.title;
        if (req.body.scheduledAt !== undefined) updates.scheduled_at = req.body.scheduledAt;
        if (req.body.location !== undefined) updates.location = req.body.location;
        if (req.body.status !== undefined) updates.status = req.body.status;

        const updated = await Soutenance.update(id, updates);
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
