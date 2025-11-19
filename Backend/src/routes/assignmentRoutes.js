const express = require('express');
const router = express.Router();
const {
    getAllAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentStats,
    getUnassignedStudents,
    getAvailableMaitres,
    getAvailableTuteurs,
    getMyAssignment
} = require('../controllers/assignmentController');
const { authenticate } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/roleCheck');

/**
 * @route   GET /api/assignments/my-assignment
 * @desc    Obtenir l'assignation de l'utilisateur connecté (étudiant)
 * @access  Private (Étudiants)
 */
router.get('/my-assignment', authenticate, getMyAssignment);

/**
 * @route   GET /api/assignments/stats
 * @desc    Obtenir les statistiques des assignations
 * @access  Private (Admin)
 */
router.get('/stats', authenticate, requireAdmin, getAssignmentStats);

/**
 * @route   GET /api/assignments/unassigned
 * @desc    Obtenir les étudiants non assignés
 * @access  Private (Admin)
 */
router.get('/unassigned', authenticate, requireAdmin, getUnassignedStudents);

/**
 * @route   GET /api/assignments/available-maitres
 * @desc    Obtenir les maîtres disponibles
 * @access  Private (Admin)
 */
router.get('/available-maitres', authenticate, requireAdmin, getAvailableMaitres);

/**
 * @route   GET /api/assignments/available-tuteurs
 * @desc    Obtenir les tuteurs disponibles
 * @access  Private (Admin)
 */
router.get('/available-tuteurs', authenticate, requireAdmin, getAvailableTuteurs);

/**
 * @route   GET /api/assignments
 * @desc    Obtenir toutes les assignations (selon le rôle)
 * @access  Private (Tous les rôles)
 */
router.get('/', authenticate, getAllAssignments);

/**
 * @route   GET /api/assignments/:id
 * @desc    Obtenir une assignation par ID
 * @access  Private (Concernés par l'assignation)
 */
router.get('/:id', authenticate, getAssignmentById);

/**
 * @route   POST /api/assignments
 * @desc    Créer une nouvelle assignation
 * @access  Private (Admin)
 */
router.post('/', authenticate, requireAdmin, createAssignment);

/**
 * @route   PUT /api/assignments/:id
 * @desc    Mettre à jour une assignation
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, requireAdmin, updateAssignment);

/**
 * @route   DELETE /api/assignments/:id
 * @desc    Supprimer une assignation
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireAdmin, deleteAssignment);

module.exports = router;
