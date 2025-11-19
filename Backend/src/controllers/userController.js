const User = require('../models/User');
const { ERROR_MESSAGES } = require('../config/constants');

// Obtenir tous les utilisateurs (Admin)
const getAllUsers = async (req, res) => {
    try {
        const { role, is_active } = req.query;

        const filters = {};
        if (role) filters.role = role;
        if (is_active !== undefined) filters.is_active = is_active === 'true';

        const users = await User.findAll(filters);

        res.json({
            success: true,
            data: users,
            count: users.length
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir un utilisateur par ID
const getUserById = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Mettre à jour un utilisateur (Admin)
const updateUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const updates = req.body;

        const updatedUser = await User.update(userId, updates);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        res.json({
            success: true,
            message: 'Utilisateur mis à jour avec succès',
            data: updatedUser
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Supprimer un utilisateur (Admin - soft delete)
const deleteUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        // Ne pas permettre de se supprimer soi-même
        if (userId === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: 'Vous ne pouvez pas supprimer votre propre compte'
            });
        }

        await User.delete(userId);

        res.json({
            success: true,
            message: 'Utilisateur désactivé avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
