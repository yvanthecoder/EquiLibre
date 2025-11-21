const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const {
    getAllRequirements,
    getRequirementById,
    createRequirement,
    updateRequirement,
    validateRequirement,
    deleteRequirement,
    getRequirementStats,
    getRequirementSubmissions,
    submitRequirement,
    updateSubmissionStatus
} = require('../controllers/requirementController');
const { authenticate } = require('../middlewares/auth');
const { requireTuteurOrAdmin, requirePermission } = require('../middlewares/roleCheck');

// Configuration du stockage des fichiers
const uploadDir = path.join(__dirname, '../../uploads/requirements');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    }
});
const upload = multer({ storage });

// Routes
router.get('/', authenticate, getAllRequirements);
router.get('/stats/:classId', authenticate, requireTuteurOrAdmin, getRequirementStats);
router.get('/:id', authenticate, getRequirementById);
router.get('/:id/submissions', authenticate, getRequirementSubmissions);

router.post('/', authenticate, requirePermission('canCreateRequirements'), createRequirement);
router.patch('/:id', authenticate, requirePermission('canEditRequirements'), updateRequirement);
router.post('/:id/validate', authenticate, requirePermission('canValidateRequirements'), validateRequirement);

router.post('/:id/submissions', authenticate, upload.single('file'), submitRequirement);
router.patch('/:id/submissions/:submissionId', authenticate, requireTuteurOrAdmin, updateSubmissionStatus);

router.delete('/:id', authenticate, requirePermission('canDeleteRequirements'), deleteRequirement);

module.exports = router;
