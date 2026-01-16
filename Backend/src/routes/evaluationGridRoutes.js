const express = require('express');
const router = express.Router();
const {
    getGrids,
    getGridById,
    createGrid,
    updateGrid,
    deleteGrid
} = require('../controllers/evaluationGridController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roleCheck');
const { USER_ROLES } = require('../config/constants');

router.get('/', authenticate, getGrids);
router.get('/:id', authenticate, getGridById);
router.post('/', authenticate, requireRole(USER_ROLES.ADMIN, USER_ROLES.TUTEUR_ECOLE), createGrid);
router.put('/:id', authenticate, requireRole(USER_ROLES.ADMIN, USER_ROLES.TUTEUR_ECOLE), updateGrid);
router.delete('/:id', authenticate, requireRole(USER_ROLES.ADMIN), deleteGrid);

module.exports = router;
