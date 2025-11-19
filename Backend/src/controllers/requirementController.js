const Requirement = require('../models/Requirement');
const { ERROR_MESSAGES, USER_ROLES, REQUIREMENT_STATUS } = require('../config/constants');

// Obtenir tous les requirements
const getAllRequirements = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.userId;
        const { classId } = req.query;

        let requirements;

        if (classId) {
            // Requirements d'une classe spécifique
            requirements = await Requirement.findByClassId(parseInt(classId));
        } else if (userRole === USER_ROLES.ADMIN) {
            // Admin voit tout (à implémenter si besoin)
            requirements = await Requirement.findByUserId(userId);
        } else {
            // Utilisateurs voient leurs requirements
            requirements = await Requirement.findByUserId(userId);
        }

        res.json({
            success: true,
            data: requirements,
            count: requirements.length
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des requirements:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir un requirement par ID
const getRequirementById = async (req, res) => {
    try {
        const requirementId = parseInt(req.params.id);

        const requirement = await Requirement.findById(requirementId);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        res.json({
            success: true,
            data: requirement
        });

    } catch (error) {
        console.error('Erreur lors de la récupération du requirement:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Créer un requirement (Admin uniquement)
const createRequirement = async (req, res) => {
    try {
        const { title, description, classId, deadline } = req.body;

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
            classId: parseInt(classId),
            createdBy: req.user.userId,
            deadline
        });

        res.status(201).json({
            success: true,
            message: 'Requirement créé avec succès',
            data: requirement
        });

    } catch (error) {
        console.error('Erreur lors de la création du requirement:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Mettre à jour un requirement (Admin)
const updateRequirement = async (req, res) => {
    try {
        const requirementId = parseInt(req.params.id);
        const updates = req.body;

        const updatedRequirement = await Requirement.update(requirementId, updates);

        if (!updatedRequirement) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        res.json({
            success: true,
            message: 'Requirement mis à jour avec succès',
            data: updatedRequirement
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du requirement:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Valider/Refuser un requirement (Tuteur ou Admin)
const validateRequirement = async (req, res) => {
    try {
        const requirementId = parseInt(req.params.id);
        const { status, comment } = req.body;

        // Vérifier que le statut est valide
        if (!status || ![REQUIREMENT_STATUS.APPROVED, REQUIREMENT_STATUS.REJECTED].includes(status)) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'Statut invalide (APPROVED ou REJECTED)'
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

        res.json({
            success: true,
            message: `Requirement ${status === REQUIREMENT_STATUS.APPROVED ? 'approuvé' : 'refusé'} avec succès`,
            data: validatedRequirement
        });

    } catch (error) {
        console.error('Erreur lors de la validation du requirement:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Supprimer un requirement (Admin)
const deleteRequirement = async (req, res) => {
    try {
        const requirementId = parseInt(req.params.id);

        await Requirement.delete(requirementId);

        res.json({
            success: true,
            message: 'Requirement supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la suppression du requirement:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir les statistiques des requirements d'une classe
const getRequirementStats = async (req, res) => {
    try {
        const classId = parseInt(req.params.classId);

        const stats = await Requirement.getStats(classId);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
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
    getRequirementStats
};
