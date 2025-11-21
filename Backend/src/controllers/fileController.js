const fs = require('fs');
const path = require('path');
const FileModel = require('../models/File');
const FileSignature = require('../models/FileSignature');
const { ERROR_MESSAGES } = require('../config/constants');

const mapFile = (file) => ({
    id: file.id,
    fileName: file.fileName,
    filePath: file.filePath,
    fileSize: file.fileSize,
    fileType: file.fileType,
    userId: file.userId,
    classId: file.classId,
    visibilityRole: file.visibilityRole,
    requiresSignature: file.requiresSignature,
    parentFileId: file.parentFileId,
    version: file.version,
    uploadedAt: file.uploadedAt
});

const getPersonalFiles = async (req, res) => {
    try {
        const files = await FileModel.findPersonalFiles(req.user.userId);
        return res.json(files.map(mapFile));
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des fichiers personnels:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const getClassFiles = async (req, res) => {
    try {
        const classId = parseInt(req.params.classId, 10);
        const files = await FileModel.findClassFiles(classId);
        return res.json(files.map(mapFile));
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des fichiers de classe:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const getSharedFiles = async (req, res) => {
    try {
        const role = req.user.role;
        const files = await FileModel.findSharedByRole(role);
        return res.json(files.map(mapFile));
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des fichiers partagAs:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const uploadFile = async (req, res) => {
    try {
        const file = req.file;
        const classId = req.body.classId ? parseInt(req.body.classId, 10) : null;
        const visibilityRole = req.body.visibilityRole || null;
        const requiresSignature = req.body.requiresSignature === 'true' || req.body.requiresSignature === true;
        const parentFileId = req.body.parentFileId ? parseInt(req.body.parentFileId, 10) : null;
        const version = req.body.version ? parseInt(req.body.version, 10) : 1;

        if (!file) {
            return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
        }

        const saved = await FileModel.create({
            userId: req.user.userId,
            classId,
            fileName: file.originalname,
            storedName: file.filename,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype,
            visibilityRole,
            requiresSignature,
            parentFileId,
            version
        });

        return res.status(201).json(mapFile(saved));
    } catch (error) {
        console.error('Erreur lors du tAclAcchargement du fichier:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const deleteFile = async (req, res) => {
    try {
        const fileId = parseInt(req.params.id, 10);
        const file = await FileModel.findById(fileId);

        if (!file) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }

        // Supprimer du disque si prAsent
        if (file.filePath && fs.existsSync(file.filePath)) {
            try {
                fs.unlinkSync(file.filePath);
            } catch (err) {
                console.warn('Impossible de supprimer le fichier disque:', err.message);
            }
        }

        await FileModel.delete(fileId);
        return res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const downloadFile = async (req, res) => {
    try {
        const fileId = parseInt(req.params.id, 10);
        const file = await FileModel.findById(fileId);

        if (!file) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }

        if (!fs.existsSync(file.filePath)) {
            return res.status(404).json({ success: false, message: 'Fichier introuvable sur le serveur' });
        }

        return res.download(path.resolve(file.filePath), file.fileName);
    } catch (error) {
        console.error('Erreur lors du tAclAcchargement:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const signFile = async (req, res) => {
    try {
        const fileId = parseInt(req.params.id, 10);
        const file = await FileModel.findById(fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
        }
        if (!file.requiresSignature) {
            return res.status(400).json({ success: false, message: 'Ce fichier ne requiert pas de signature' });
        }
        const signed = await FileSignature.sign(fileId, req.user.userId);
        return res.json({ success: true, data: signed });
    } catch (error) {
        console.error('Erreur lors de la signature du fichier:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

const getFileSignatures = async (req, res) => {
    try {
        const fileId = parseInt(req.params.id, 10);
        const signatures = await FileSignature.list(fileId);
        return res.json({ success: true, data: signatures });
    } catch (error) {
        console.error('Erreur lors de la rAccupAcration des signatures:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
};

module.exports = {
    getPersonalFiles,
    getClassFiles,
    getSharedFiles,
    uploadFile,
    deleteFile,
    downloadFile,
    signFile,
    getFileSignatures
};
