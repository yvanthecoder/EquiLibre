const express = require('express');
const router = express.Router();
const {
    createEvaluation,
    getStudentEvaluations,
    getContextEvaluations,
    getEvaluationScores
} = require('../controllers/evaluationController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roleCheck');
const { USER_ROLES } = require('../config/constants');

router.post('/', authenticate, requireRole(USER_ROLES.ADMIN, USER_ROLES.TUTEUR_ECOLE, USER_ROLES.MAITRE_APP, USER_ROLES.JURY, USER_ROLES.INTERVENANT), createEvaluation);
router.get('/student/:studentId', authenticate, getStudentEvaluations);
router.get('/', authenticate, getContextEvaluations);
router.get('/:id/scores', authenticate, getEvaluationScores);

module.exports = router;
