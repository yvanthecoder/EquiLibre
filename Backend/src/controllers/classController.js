const Class = require('../models/Class');
const Requirement = require('../models/Requirement');
const RequirementSubmission = require('../models/RequirementSubmission');
const Event = require('../models/Event');
const { ERROR_MESSAGES, USER_ROLES } = require('../config/constants');

const mapClass = (cls) => ({
    id: cls.id,
    name: cls.name,
    description: cls.description,
    year: cls.year,
    level: cls.level,
    tuteurId: cls.tuteur_id,
    tuteur: cls.tuteur_firstname ? {
        firstname: cls.tuteur_firstname,
        lastname: cls.tuteur_lastname,
        email: cls.tuteur_email
    } : null,
    memberCount: cls.member_count
});

const mapMember = (member) => ({
    id: member.id,
    email: member.email,
    firstName: member.firstname,
    lastName: member.lastname,
    role: member.role,
    company: member.company,
    joinedAt: member.joined_at
});

const mapRequirement = (item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    classId: item.classId,
    createdBy: item.createdBy,
    dueDate: item.dueDate,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
});

const mapSubmission = (row) => ({
    id: row.id,
    requirementId: row.requirementId,
    userId: row.userId,
    fileName: row.fileName,
    filePath: row.filePath,
    status: row.status,
    feedback: row.feedback,
    submittedAt: row.submittedAt
});

// Obtenir toutes les classes
const getAllClasses = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.userId;

        let classes;

        if (userRole === USER_ROLES.ADMIN) {
            classes = await Class.findAll();
        } else if (userRole === USER_ROLES.TUTEUR_ECOLE) {
            classes = await Class.findByTuteurId(userId);
        } else {
            classes = await Class.findByUserId(userId);
        }

        return res.json(classes.map(mapClass));
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des classes:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir une classe par ID
const getClassById = async (req, res) => {
    try {
        const classId = parseInt(req.params.id, 10);
        const classData = await Class.findById(classId);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        return res.json(mapClass(classData));
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration de la classe:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// CrAcer une nouvelle classe (Admin ou Tuteur)
const createClass = async (req, res) => {
    try {
        const { name, description, year, level, tuteurId } = req.body;

        if (!name || !year) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'Le nom et l\'annAce sont requis'
            });
        }

        const newClass = await Class.create({
            name,
            description,
            year,
            level,
            tuteurId
        });

        return res.status(201).json(mapClass(newClass));
    } catch (error) {
        console.error('Erreur lors de la crAcation de la classe:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Mettre A� jour une classe
const updateClass = async (req, res) => {
    try {
        const classId = parseInt(req.params.id, 10);
        const updates = req.body;

        const updatedClass = await Class.update(classId, updates);

        if (!updatedClass) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        return res.json(mapClass(updatedClass));
    } catch (error) {
        console.error('Erreur lors de la mise A� jour de la classe:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Supprimer une classe (Admin)
const deleteClass = async (req, res) => {
    try {
        const classId = parseInt(req.params.id, 10);
        await Class.delete(classId);
        return res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression de la classe:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir les membres d'une classe
const getClassMembers = async (req, res) => {
    try {
        const classId = parseInt(req.params.id, 10);
        const members = await Class.getMembers(classId);
        return res.json(members.map(mapMember));
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des membres:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Ajouter un membre A� une classe (Admin ou Tuteur)
const addMember = async (req, res) => {
    try {
        const classId = parseInt(req.params.id, 10);
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'userId requis'
            });
        }

        const member = await Class.addMember(classId, userId);
        return res.status(201).json(member);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du membre:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Retirer un membre d'une classe (Admin ou Tuteur)
const removeMember = async (req, res) => {
    try {
        const classId = parseInt(req.params.id, 10);
        const userId = parseInt(req.params.userId, 10);
        await Class.removeMember(classId, userId);
        return res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors du retrait du membre:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir les classes disponibles (public - pour inscription)
const getAvailableClasses = async (req, res) => {
    try {
        const classes = await Class.findAll();
        const availableClasses = classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            description: cls.description,
            year: cls.year,
            level: cls.level
        }));

        return res.json(availableClasses);
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des classes disponibles:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// RAccupAcrer les requirements d'une classe (avec soumissions)
const getClassRequirements = async (req, res) => {
    try {
        const classId = parseInt(req.params.id, 10);
        const requirements = await Requirement.findByClassId(classId);

        const withSubmissions = await Promise.all(
            requirements.map(async (reqItem) => {
                const submissions = await RequirementSubmission.findByRequirement(reqItem.id);
                return {
                    ...mapRequirement(reqItem),
                    submissions: submissions.map(mapSubmission)
                };
            })
        );

        return res.json(withSubmissions);
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des requirements de la classe:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// RAccupAcrer les AcvAcnements d'une classe
const getClassEvents = async (req, res) => {
    try {
        const classId = parseInt(req.params.id, 10);
        const events = await Event.findByClassId(classId);
        return res.json(events);
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des AcvAcnements:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// CrAcer un AcvAcnement de classe
const createEvent = async (req, res) => {
    try {
        const classId = parseInt(req.params.id, 10);
        const event = await Event.create({
            ...req.body,
            classId,
            userId: req.user.userId
        });
        return res.status(201).json(event);
    } catch (error) {
        console.error('Erreur lors de la crAcation de l\'AcvAcnement:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Mettre A� jour un AcvAcnement
const updateEvent = async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        const payload = {};
        if (req.body.title !== undefined) payload.title = req.body.title;
        if (req.body.description !== undefined) payload.description = req.body.description;
        if (req.body.startDate !== undefined) payload.start_date = req.body.startDate;
        if (req.body.endDate !== undefined) payload.end_date = req.body.endDate;
        if (req.body.type !== undefined) payload.type = req.body.type;

        const updated = await Event.update(eventId, payload);
        return res.json(updated);
    } catch (error) {
        console.error('Erreur lors de la mise A� jour de l\'AcvAcnement:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Supprimer un AcvAcnement
const deleteEvent = async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        await Event.delete(eventId);
        return res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'AcvAcnement:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

module.exports = {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    getClassMembers,
    addMember,
    removeMember,
    getAvailableClasses,
    getClassRequirements,
    getClassEvents,
    createEvent,
    updateEvent,
    deleteEvent
};
