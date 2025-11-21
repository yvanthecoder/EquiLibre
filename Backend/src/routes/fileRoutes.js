const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { requireClassAccess } = require('../middlewares/roleCheck');
const {
    getPersonalFiles,
    getClassFiles,
    uploadFile,
    deleteFile,
    downloadFile
} = require('../controllers/fileController');

const uploadDir = path.join(__dirname, '../../uploads/files');
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

router.get('/personal', authenticate, getPersonalFiles);
router.get('/class/:classId', authenticate, requireClassAccess, getClassFiles);
router.post('/upload', authenticate, upload.single('file'), uploadFile);
router.delete('/:id', authenticate, deleteFile);
router.get('/:id/download', authenticate, downloadFile);

module.exports = router;
