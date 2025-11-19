const Class = require('../models/Class');
const { ERROR_MESSAGES, USER_ROLES } = require('../config/constants');

// Obtenir toutes les classes
const getAllClasses = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.userId;

        let classes;

        // Admin voit toutes les classes
        if (userRole === USER_ROLES.ADMIN) {
            classes = await Class.findAll();
        }
        // Tuteur voit ses classes
        else if (userRole === USER_ROLES.TUTEUR_ECOLE) {
            classes = await Class.findByTuteurId(userId);
        }
        // Étudiants et Maîtres d'app voient leurs classes
        else {
            classes = await Class.findByUserId(userId);
        }

        res.json({
            success: true,
            data: classes,
            count: classes.length
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des classes:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir une classe par ID
const getClassById = async (req, res) => {
    try {
        const classId = parseInt(req.params.id);

        const classData = await Class.findById(classId);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        res.json({
            success: true,
            data: classData
        });

    } catch (error) {
        console.error('Erreur lors de la récupération de la classe:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Créer une nouvelle classe (Admin ou Tuteur)
const createClass = async (req, res) => {
    try {
        const { name, description, year, level, tuteurId } = req.body;

        if (!name || !year) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'Le nom et l\'année sont requis'
            });
        }

        const newClass = await Class.create({
            name,
            description,
            year,
            level,
            tuteurId
        });

        res.status(201).json({
            success: true,
            message: 'Classe créée avec succès',
            data: newClass
        });

    } catch (error) {
        console.error('Erreur lors de la création de la classe:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Mettre à jour une classe
const updateClass = async (req, res) => {
    try {
        const classId = parseInt(req.params.id);
        const updates = req.body;

        const updatedClass = await Class.update(classId, updates);

        if (!updatedClass) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        res.json({
            success: true,
            message: 'Classe mise à jour avec succès',
            data: updatedClass
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour de la classe:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Supprimer une classe (Admin)
const deleteClass = async (req, res) => {
    try {
        const classId = parseInt(req.params.id);

        await Class.delete(classId);

        res.json({
            success: true,
            message: 'Classe désactivée avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la suppression de la classe:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir les membres d'une classe
const getClassMembers = async (req, res) => {
    try {
        const classId = parseInt(req.params.id);

        const members = await Class.getMembers(classId);

        res.json({
            success: true,
            data: members,
            count: members.length
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des membres:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Ajouter un membre à une classe (Admin ou Tuteur)
const addMember = async (req, res) => {
    try {
        const classId = parseInt(req.params.id);
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'userId requis'
            });
        }

        const member = await Class.addMember(classId, userId);

        res.status(201).json({
            success: true,
            message: 'Membre ajouté avec succès',
            data: member
        });

    } catch (error) {
        console.error('Erreur lors de l\'ajout du membre:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Retirer un membre d'une classe (Admin ou Tuteur)
const removeMember = async (req, res) => {
    try {
        const classId = parseInt(req.params.id);
        const userId = parseInt(req.params.userId);

        await Class.removeMember(classId, userId);

        res.json({
            success: true,
            message: 'Membre retiré avec succès'
        });

    } catch (error) {
        console.error('Erreur lors du retrait du membre:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir les classes disponibles (public - pour inscription)
const getAvailableClasses = async (req, res) => {
    try {
        const classes = await Class.findAll();

        // Ne retourner que les infos essentielles
        const availableClasses = classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            description: cls.description,
            year: cls.year,
            level: cls.level
        }));

        res.json({
            success: true,
            data: availableClasses
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des classes disponibles:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

module.exports = {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    getClassMembers,
    addMember,
    removeMember,
    getAvailableClasses
};
