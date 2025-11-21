const bcrypt = require('bcrypt');
const User = require('../models/User');
const ClassModel = require('../models/Class');
const { ERROR_MESSAGES } = require('../config/constants');

const mapUser = (user) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstname,
    lastName: user.lastname,
    role: user.role,
    company: user.company,
    phone: user.phone,
    avatar: user.profile_picture,
    classId: user.class_id,
    jobTitle: user.job_title,
    createdAt: user.created_at,
    lastLogin: user.last_login,
    isActive: user.is_active,
    isVerified: user.is_verified
});

// Obtenir tous les utilisateurs (Admin)
const getAllUsers = async (req, res) => {
    try {
        const { role, is_active } = req.query;

        const filters = {};
        if (role) filters.role = role;
        if (is_active !== undefined) filters.is_active = is_active === 'true';

        const users = await User.findAll(filters);
        return res.json(users.map(mapUser));
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des utilisateurs:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir un utilisateur par ID
const getUserById = async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        return res.json(mapUser(user));
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration de l\'utilisateur:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Mettre A� jour un utilisateur (Admin)
const updateUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        const body = req.body;
        const updates = {};

        if (body.firstName !== undefined) updates.firstname = body.firstName;
        if (body.lastName !== undefined) updates.lastname = body.lastName;
        if (body.phone !== undefined) updates.phone = body.phone;
        if (body.company !== undefined) updates.company = body.company;
        if (body.avatar !== undefined) updates.profile_picture = body.avatar;
        if (body.classId !== undefined) {
            const newClassId = body.classId === null ? null : parseInt(body.classId, 10);
            updates.class_id = newClassId;
            const previous = await User.findById(userId);
            if (previous?.class_id && previous.class_id !== newClassId) {
                try {
                    await ClassModel.removeMember(previous.class_id, userId);
                } catch (err) {
                    console.warn('Impossible de retirer l\'ancien rattachement classe:', err.message);
                }
            }
            if (newClassId) {
                try {
                    await ClassModel.addMember(newClassId, userId);
                } catch (err) {
                    console.warn('Impossible d\'ajouter l\'utilisateur à la classe:', err.message);
                }
            }
        }
        if (body.jobTitle !== undefined) updates.job_title = body.jobTitle;
        if (body.role !== undefined) updates.role = body.role;
        if (body.email !== undefined) updates.email = body.email;
        if (body.isActive !== undefined) updates.is_active = body.isActive;

        if (body.password !== undefined && body.password !== '') {
            updates.password = await bcrypt.hash(body.password, 10);
        }

        const updatedUser = await User.update(userId, updates);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        return res.json(mapUser(updatedUser));
    } catch (error) {
        console.error('Erreur lors de la mise A� jour de l\'utilisateur:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Supprimer un utilisateur (Admin - soft delete)
const deleteUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);

        if (userId === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: 'Vous ne pouvez pas supprimer votre propre compte'
            });
        }

        await User.delete(userId);
        return res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        return res.status(500).json({
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
