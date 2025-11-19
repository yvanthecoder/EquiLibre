const express = require('express');
const router = express.Router();
const {
    getAllRequirements,
    getRequirementById,
    createRequirement,
    updateRequirement,
    validateRequirement,
    deleteRequirement,
    getRequirementStats
} = require('../controllers/requirementController');
const { authenticate } = require('../middlewares/auth');
const { requireAdmin, requireTuteurOrAdmin, requirePermission } = require('../middlewares/roleCheck');

/**
 * @route   GET /api/requirements
 * @desc    Obtenir tous les requirements (selon le rôle et filtres)
 * @access  Private (Tous les rôles)
 */
router.get('/', authenticate, getAllRequirements);

/**
 * @route   GET /api/requirements/:id
 * @desc    Obtenir un requirement par ID
 * @access  Private (Tous les rôles)
 */
router.get('/:id', authenticate, getRequirementById);

/**
 * @route   POST /api/requirements
 * @desc    Créer un nouveau requirement
 * @access  Private (Admin uniquement)
 */
router.post('/', authenticate, requirePermission('canCreateRequirements'), createRequirement);

/**
 * @route   PUT /api/requirements/:id
 * @desc    Mettre à jour un requirement
 * @access  Private (Admin uniquement)
 */
router.put('/:id', authenticate, requirePermission('canEditRequirements'), updateRequirement);

/**
 * @route   POST /api/requirements/:id/validate
 * @desc    Valider ou refuser un requirement
 * @access  Private (Tuteur ou Admin)
 */
router.post('/:id/validate', authenticate, requirePermission('canValidateRequirements'), validateRequirement);

/**
 * @route   DELETE /api/requirements/:id
 * @desc    Supprimer un requirement
 * @access  Private (Admin uniquement)
 */
router.delete('/:id', authenticate, requirePermission('canDeleteRequirements'), deleteRequirement);

/**
 * @route   GET /api/requirements/stats/:classId
 * @desc    Obtenir les statistiques des requirements d'une classe
 * @access  Private (Tuteur ou Admin)
 */
router.get('/stats/:classId', authenticate, requireTuteurOrAdmin, getRequirementStats);

module.exports = router;
