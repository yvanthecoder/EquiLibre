const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/classController');
const { authenticate } = require('../middlewares/auth');
const { requireAdmin, requireTuteurOrAdmin, requireClassAccess } = require('../middlewares/roleCheck');

/**
 * @route   GET /api/classes/available
 * @desc    Obtenir les classes disponibles (pour inscription)
 * @access  Public
 */
router.get('/available', getAvailableClasses);

/**
 * @route   GET /api/classes
 * @desc    Obtenir toutes les classes (selon le rôle)
 * @access  Private (Tous les rôles)
 */
router.get('/', authenticate, getAllClasses);

/**
 * @route   GET /api/classes/:id
 * @desc    Obtenir une classe par ID
 * @access  Private (Membres de la classe, Tuteur, Admin)
 */
router.get('/:id', authenticate, requireClassAccess, getClassById);
router.get('/:id/requirements', authenticate, requireClassAccess, getClassRequirements);
router.get('/:id/events', authenticate, requireClassAccess, getClassEvents);
router.post('/:id/events', authenticate, requireTuteurOrAdmin, requireClassAccess, createEvent);
router.patch('/:id/events/:eventId', authenticate, requireTuteurOrAdmin, requireClassAccess, updateEvent);
router.delete('/:id/events/:eventId', authenticate, requireTuteurOrAdmin, requireClassAccess, deleteEvent);

/**
 * @route   POST /api/classes
 * @desc    Créer une nouvelle classe
 * @access  Private (Admin ou Tuteur)
 */
router.post('/', authenticate, requireTuteurOrAdmin, createClass);

/**
 * @route   PUT /api/classes/:id
 * @desc    Mettre à jour une classe
 * @access  Private (Admin ou Tuteur de la classe)
 */
router.put('/:id', authenticate, requireTuteurOrAdmin, updateClass);

/**
 * @route   DELETE /api/classes/:id
 * @desc    Supprimer une classe
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireAdmin, deleteClass);

/**
 * @route   GET /api/classes/:id/members
 * @desc    Obtenir les membres d'une classe
 * @access  Private (Membres de la classe, Tuteur, Admin)
 */
router.get('/:id/members', authenticate, requireClassAccess, getClassMembers);

/**
 * @route   POST /api/classes/:id/members
 * @desc    Ajouter un membre à une classe
 * @access  Private (Admin ou Tuteur de la classe)
 */
router.post('/:id/members', authenticate, requireTuteurOrAdmin, addMember);

/**
 * @route   DELETE /api/classes/:id/members/:userId
 * @desc    Retirer un membre d'une classe
 * @access  Private (Admin ou Tuteur de la classe)
 */
router.delete('/:id/members/:userId', authenticate, requireTuteurOrAdmin, removeMember);

module.exports = router;
