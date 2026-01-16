const express = require('express');
const router = express.Router();
const {
    getInterviews,
    getInterviewById,
    createInterview,
    updateInterview,
    deleteInterview
} = require('../controllers/interviewController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roleCheck');
const { USER_ROLES } = require('../config/constants');

router.get('/', authenticate, getInterviews);
router.get('/:id', authenticate, getInterviewById);
router.post('/', authenticate, requireRole(
    USER_ROLES.ADMIN,
    USER_ROLES.TUTEUR_ECOLE,
    USER_ROLES.MAITRE_APP,
    USER_ROLES.ALTERNANT,
    USER_ROLES.ETUDIANT_CLASSIQUE
), createInterview);
router.put('/:id', authenticate, requireRole(
    USER_ROLES.ADMIN,
    USER_ROLES.TUTEUR_ECOLE,
    USER_ROLES.MAITRE_APP
), updateInterview);
router.delete('/:id', authenticate, requireRole(USER_ROLES.ADMIN), deleteInterview);

module.exports = router;
