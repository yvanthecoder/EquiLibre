const express = require('express');
const router = express.Router();
const {
    getSoutenances,
    getSoutenanceById,
    createSoutenance,
    updateSoutenance,
    deleteSoutenance,
    addJuryMember,
    removeJuryMember,
    listJury
} = require('../controllers/soutenanceController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roleCheck');
const { USER_ROLES } = require('../config/constants');

router.get('/', authenticate, getSoutenances);
router.get('/:id', authenticate, getSoutenanceById);
router.post('/', authenticate, requireRole(USER_ROLES.ADMIN), createSoutenance);
router.put('/:id', authenticate, requireRole(USER_ROLES.ADMIN), updateSoutenance);
router.delete('/:id', authenticate, requireRole(USER_ROLES.ADMIN), deleteSoutenance);
router.get('/:id/jury', authenticate, listJury);
router.post('/:id/jury', authenticate, requireRole(USER_ROLES.ADMIN), addJuryMember);
router.delete('/:id/jury/:userId', authenticate, requireRole(USER_ROLES.ADMIN), removeJuryMember);

module.exports = router;
