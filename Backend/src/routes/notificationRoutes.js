const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
} = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roleCheck');

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// GET /api/notifications - Obtenir toutes les notifications de l'utilisateur
router.get('/', getNotifications);

// PATCH /api/notifications/:id/read - Marquer une notification comme lue
router.patch('/:id/read', markAsRead);

// PATCH /api/notifications/read-all - Marquer toutes les notifications comme lues
router.patch('/read-all', markAllAsRead);

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', deleteNotification);

// POST /api/notifications - Créer une notification (admin seulement)
router.post('/', requireRole('ADMIN', 'TUTEUR_ECOLE'), createNotification);

module.exports = router;
