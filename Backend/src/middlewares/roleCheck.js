const { USER_ROLES, ERROR_MESSAGES, ROLE_PERMISSIONS } = require('../config/constants');

// Middleware pour vérifier les rôles autorisés
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: ERROR_MESSAGES.FORBIDDEN,
                detail: `Accès réservé aux rôles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

// Middleware pour vérifier si l'utilisateur est admin
const requireAdmin = requireRole(USER_ROLES.ADMIN);

// Middleware pour vérifier si l'utilisateur est tuteur ou admin
const requireTuteurOrAdmin = requireRole(USER_ROLES.TUTEUR_ECOLE, USER_ROLES.ADMIN);

// Middleware pour vérifier si l'utilisateur est étudiant (alternant ou classique)
const requireStudent = requireRole(USER_ROLES.ALTERNANT, USER_ROLES.ETUDIANT_CLASSIQUE);

// Middleware pour vérifier les permissions spécifiques
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED
            });
        }

        const userRole = req.user.role;
        const permissions = ROLE_PERMISSIONS[userRole];

        if (!permissions || !permissions[permission]) {
            return res.status(403).json({
                success: false,
                message: ERROR_MESSAGES.FORBIDDEN,
                detail: `Permission requise: ${permission}`
            });
        }

        next();
    };
};

// Middleware pour vérifier si l'utilisateur accède à ses propres données
const requireOwnerOrAdmin = (userIdParam = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED
            });
        }

        const requestedUserId = parseInt(req.params[userIdParam]);
        const currentUserId = req.user.userId;

        // Admin peut accéder à tout
        if (req.user.role === USER_ROLES.ADMIN) {
            return next();
        }

        // Sinon, vérifier que c'est bien l'utilisateur lui-même
        if (requestedUserId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: ERROR_MESSAGES.FORBIDDEN,
                detail: 'Vous ne pouvez accéder qu\'à vos propres données'
            });
        }

        next();
    };
};

// Middleware pour vérifier l'accès à une classe
const requireClassAccess = async (req, res, next) => {
    try {
        const classId = parseInt(req.params.classId);
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Admin a accès à tout
        if (userRole === USER_ROLES.ADMIN) {
            return next();
        }

        const Class = require('../models/Class');

        // Tuteur : vérifier qu'il est tuteur de cette classe
        if (userRole === USER_ROLES.TUTEUR_ECOLE) {
            const classData = await Class.findById(classId);
            if (classData && classData.tuteur_id === userId) {
                return next();
            }
        }

        // Étudiant ou Maître d'app : vérifier qu'il est membre de la classe
        const userClasses = await Class.findByUserId(userId);
        const hasAccess = userClasses.some(c => c.id === classId);

        if (hasAccess) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: ERROR_MESSAGES.FORBIDDEN,
            detail: 'Vous n\'avez pas accès à cette classe'
        });

    } catch (error) {
        console.error('Erreur lors de la vérification d\'accès à la classe:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

module.exports = {
    requireRole,
    requireAdmin,
    requireTuteurOrAdmin,
    requireStudent,
    requirePermission,
    requireOwnerOrAdmin,
    requireClassAccess
};
