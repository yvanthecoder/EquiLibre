const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const { requireAdmin, requireOwnerOrAdmin } = require('../middlewares/roleCheck');

/**
 * @route   GET /api/users
 * @desc    Obtenir tous les utilisateurs (filtres optionnels)
 * @access  Private (Admin)
 */
router.get('/', authenticate, requireAdmin, getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obtenir un utilisateur par ID
 * @access  Private (Owner ou Admin)
 */
router.get('/:id', authenticate, requireOwnerOrAdmin('id'), getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, requireAdmin, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Supprimer un utilisateur (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireAdmin, deleteUser);

module.exports = router;
