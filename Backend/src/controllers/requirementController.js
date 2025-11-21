const Requirement = require('../models/Requirement');
const RequirementSubmission = require('../models/RequirementSubmission');
const { ERROR_MESSAGES, USER_ROLES, REQUIREMENT_STATUS } = require('../config/constants');

// Helper pour normaliser les requirements vers le frontend
const mapRequirement = (reqRow) => {
    if (!reqRow) return null;
    return {
        id: reqRow.id,
        title: reqRow.title,
        description: reqRow.description,
        classId: reqRow.classId,
        createdBy: reqRow.createdBy,
        dueDate: reqRow.dueDate,
        status: reqRow.status,
        createdAt: reqRow.createdAt,
        updatedAt: reqRow.updatedAt,
        validationComment: reqRow.validationComment,
        validatedAt: reqRow.validatedAt,
        validatedBy: reqRow.validatedBy
    };
};

const mapSubmission = (row) => ({
    id: row.id,
    requirementId: row.requirementId,
    userId: row.userId,
    fileName: row.fileName,
    filePath: row.filePath,
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    status: row.status,
    feedback: row.feedback,
    submittedAt: row.submittedAt,
    validatedAt: row.validatedAt,
    updatedAt: row.updatedAt,
    firstname: row.firstname,
    lastname: row.lastname,
    email: row.email
});

// Obtenir tous les requirements
const getAllRequirements = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.userId;
        const { classId } = req.query;

        let requirements;

        if (classId) {
            requirements = await Requirement.findByClassId(parseInt(classId, 10));
        } else if (userRole === USER_ROLES.ADMIN) {
            requirements = await Requirement.findByUserId(userId);
        } else {
            requirements = await Requirement.findByUserId(userId);
        }

        return res.json(requirements.map(mapRequirement));
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des requirements:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir un requirement par ID
const getRequirementById = async (req, res) => {
    try {
        const requirementId = parseInt(req.params.id, 10);
        const requirement = await Requirement.findById(requirementId);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        return res.json(mapRequirement(requirement));
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration du requirement:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// CrAcer un requirement (Admin uniquement)
const createRequirement = async (req, res) => {
    try {
        const { title, description, classId, dueDate } = req.body;

        if (!title || !description || !classId) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'Titre, description et classId sont requis'
            });
        }

        const requirement = await Requirement.create({
            title,
            description,
            classId: parseInt(classId, 10),
            createdBy: req.user.userId,
            dueDate
        });

        return res.status(201).json(mapRequirement(requirement));
    } catch (error) {
        console.error('Erreur lors de la crAcation du requirement:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Mettre A� jour un requirement
const updateRequirement = async (req, res) => {
    try {
        const requirementId = parseInt(req.params.id, 10);
        const updates = {};

        if (req.body.title !== undefined) updates.title = req.body.title;
        if (req.body.description !== undefined) updates.description = req.body.description;
        if (req.body.dueDate !== undefined) updates.due_date = req.body.dueDate;
        if (req.body.status !== undefined) updates.status = req.body.status;

        const updatedRequirement = await Requirement.update(requirementId, updates);

        if (!updatedRequirement) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        return res.json(mapRequirement(updatedRequirement));
    } catch (error) {
        console.error('Erreur lors de la mise A� jour du requirement:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Valider/Refuser un requirement (Tuteur ou Admin)
const validateRequirement = async (req, res) => {
    try {
        const requirementId = parseInt(req.params.id, 10);
        const { status, comment } = req.body;

        if (!status || ![REQUIREMENT_STATUS.VALIDATED, REQUIREMENT_STATUS.REJECTED].includes(status)) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'Statut invalide (VALIDATED ou REJECTED)'
            });
        }

        const validatedRequirement = await Requirement.validate(
            requirementId,
            req.user.userId,
            status,
            comment
        );

        if (!validatedRequirement) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        return res.json(mapRequirement(validatedRequirement));
    } catch (error) {
        console.error('Erreur lors de la validation du requirement:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Supprimer un requirement (Admin)
const deleteRequirement = async (req, res) => {
    try {
        const requirementId = parseInt(req.params.id, 10);
        await Requirement.delete(requirementId);
        return res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression du requirement:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir les statistiques des requirements d'une classe
const getRequirementStats = async (req, res) => {
    try {
        const classId = parseInt(req.params.classId, 10);
        const stats = await Requirement.getStats(classId);
        return res.json(stats);
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des statistiques:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// RAccupAcration des soumissions d'un requirement
const getRequirementSubmissions = async (req, res) => {
    try {
        const requirementId = parseInt(req.params.id, 10);
        const submissions = await RequirementSubmission.findByRequirement(requirementId);
        return res.json(submissions.map(mapSubmission));
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des soumissions:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Soumettre un document pour un requirement
const submitRequirement = async (req, res) => {
    try {
        const requirementId = parseInt(req.params.id, 10);
        const userId = req.user.userId;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier transmis'
            });
        }

        const submission = await RequirementSubmission.create({
            requirementId,
            userId,
            fileName: file.originalname,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype
        });

        return res.status(201).json(mapSubmission(submission));
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la soumission:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Mettre A� jour une soumission (Validation ou rejet)
const updateSubmissionStatus = async (req, res) => {
    try {
        const submissionId = parseInt(req.params.submissionId, 10);
        const { status, feedback } = req.body;

        if (!status || ![REQUIREMENT_STATUS.VALIDATED, REQUIREMENT_STATUS.REJECTED].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const updated = await RequirementSubmission.updateStatus(submissionId, status, feedback);
        return res.json(mapSubmission(updated));
    } catch (error) {
        console.error('Erreur lors de la mise A� jour de la soumission:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

module.exports = {
    getAllRequirements,
    getRequirementById,
    createRequirement,
    updateRequirement,
    validateRequirement,
    deleteRequirement,
    getRequirementStats,
    getRequirementSubmissions,
    submitRequirement,
    updateSubmissionStatus
};
