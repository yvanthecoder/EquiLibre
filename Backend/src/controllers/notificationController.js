const pool = require('../config/database');
const { ERROR_MESSAGES } = require('../config/constants');

// Obtenir toutes les notifications de l'utilisateur connecté
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                id,
                title,
                message,
                type,
                is_read as "isRead",
                link,
                metadata,
                created_at as "createdAt"
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Marquer une notification comme lue
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `UPDATE notifications
            SET is_read = true
            WHERE id = $1 AND user_id = $2
            RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification non trouvée'
            });
        }

        res.json({
            success: true,
            message: 'Notification marquée comme lue'
        });

    } catch (error) {
        console.error('Erreur lors du marquage de la notification:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Marquer toutes les notifications comme lues
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;

        await pool.query(
            `UPDATE notifications
            SET is_read = true
            WHERE user_id = $1 AND is_read = false`,
            [userId]
        );

        res.json({
            success: true,
            message: 'Toutes les notifications ont été marquées comme lues'
        });

    } catch (error) {
        console.error('Erreur lors du marquage des notifications:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Supprimer une notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `DELETE FROM notifications
            WHERE id = $1 AND user_id = $2
            RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification non trouvée'
            });
        }

        res.json({
            success: true,
            message: 'Notification supprimée'
        });

    } catch (error) {
        console.error('Erreur lors de la suppression de la notification:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Créer une notification (pour les admins/système)
const createNotification = async (req, res) => {
    try {
        const { userId, title, message, type, link, metadata } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'userId, title et message sont requis'
            });
        }

        const result = await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, link, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, title, message, type, is_read as "isRead", created_at as "createdAt"`,
            [userId, title, message, type || 'info', link, metadata]
        );

        res.status(201).json({
            success: true,
            message: 'Notification créée',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Erreur lors de la création de la notification:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
};
