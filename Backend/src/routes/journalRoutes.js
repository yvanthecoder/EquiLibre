const express = require('express');
const router = express.Router();
const {
    getMyJournals,
    getJournalById,
    createJournal,
    updateJournal,
    submitJournal,
    validateJournal,
    getClassJournals
} = require('../controllers/journalController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roleCheck');
const { USER_ROLES } = require('../config/constants');

router.get('/me', authenticate, getMyJournals);
router.get('/class/:classId', authenticate, requireRole(USER_ROLES.ADMIN, USER_ROLES.TUTEUR_ECOLE, USER_ROLES.MAITRE_APP), getClassJournals);
router.get('/:id', authenticate, getJournalById);
router.post('/', authenticate, requireRole(USER_ROLES.ALTERNANT, USER_ROLES.ETUDIANT_CLASSIQUE), createJournal);
router.put('/:id', authenticate, updateJournal);
router.post('/:id/submit', authenticate, submitJournal);
router.post('/:id/validate', authenticate, requireRole(USER_ROLES.ADMIN, USER_ROLES.TUTEUR_ECOLE, USER_ROLES.MAITRE_APP), validateJournal);

module.exports = router;
