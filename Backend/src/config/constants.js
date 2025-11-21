// =============================================
// CONSTANTES DE L'APPLICATION
// =============================================

// Rôles utilisateurs
const USER_ROLES = {
    ALTERNANT: 'ALTERNANT',
    ETUDIANT_CLASSIQUE: 'ETUDIANT_CLASSIQUE',
    MAITRE_APP: 'MAITRE_APP',
    TUTEUR_ECOLE: 'TUTEUR_ECOLE',
    ADMIN: 'ADMIN'
};

// Statuts des requirements
const REQUIREMENT_STATUS = {
    PENDING: 'PENDING',
    SUBMITTED: 'SUBMITTED',
    VALIDATED: 'VALIDATED',
    REJECTED: 'REJECTED',
    LOCKED: 'LOCKED'
};

// Types de notifications
const NOTIFICATION_TYPES = {
    INFO: 'info',
    WARNING: 'warning',
    SUCCESS: 'success',
    ERROR: 'error'
};

// Messages d'erreur courants
const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Non autorisé',
    FORBIDDEN: 'Accès interdit',
    NOT_FOUND: 'Ressource introuvable',
    BAD_REQUEST: 'Requête invalide',
    SERVER_ERROR: 'Erreur serveur',
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    EMAIL_EXISTS: 'Cet email est déjà utilisé',
    TOKEN_EXPIRED: 'Token expiré',
    INVALID_TOKEN: 'Token invalide'
};

// Permissions par rôle
const ROLE_PERMISSIONS = {
    ADMIN: {
        canCreateRequirements: true,
        canEditRequirements: true,
        canDeleteRequirements: true,
        canValidateRequirements: true,
        canManageUsers: true,
        canManageClasses: true,
        canViewAllData: true
    },
    TUTEUR_ECOLE: {
        canCreateRequirements: true,
        canEditRequirements: true,
        canDeleteRequirements: true,
        canValidateRequirements: true,
        canManageUsers: false,
        canManageClasses: true,
        canViewClassData: true
    },
    MAITRE_APP: {
        canCreateRequirements: false,
        canEditRequirements: false,
        canDeleteRequirements: false,
        canValidateRequirements: false,
        canManageUsers: false,
        canManageClasses: false,
        canViewStudentData: true
    },
    ALTERNANT: {
        canCreateRequirements: false,
        canEditRequirements: false,
        canDeleteRequirements: false,
        canValidateRequirements: false,
        canManageUsers: false,
        canManageClasses: false,
        canViewOwnData: true
    },
    ETUDIANT_CLASSIQUE: {
        canCreateRequirements: false,
        canEditRequirements: false,
        canDeleteRequirements: false,
        canValidateRequirements: false,
        canManageUsers: false,
        canManageClasses: false,
        canViewOwnData: true
    }
};

module.exports = {
    USER_ROLES,
    REQUIREMENT_STATUS,
    NOTIFICATION_TYPES,
    ERROR_MESSAGES,
    ROLE_PERMISSIONS
};
