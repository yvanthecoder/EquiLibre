const express = require('express');
const router = express.Router();
const { exportAssignments } = require('../controllers/reportController');
const { authenticate } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/roleCheck');

router.get('/assignments', authenticate, requireAdmin, exportAssignments);

module.exports = router;
