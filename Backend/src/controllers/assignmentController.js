const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { ERROR_MESSAGES, USER_ROLES } = require('../config/constants');

// Obtenir toutes les assignations
const getAllAssignments = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.userId;
        let assignments;

        // Admin voit toutes les assignations
        if (userRole === USER_ROLES.ADMIN) {
            const filters = {
                studentId: req.query.studentId,
                maitreId: req.query.maitreId,
                tuteurId: req.query.tuteurId,
                classId: req.query.classId
            };
            assignments = await Assignment.findAll(filters);
        }
        // Maître voit ses étudiants
        else if (userRole === USER_ROLES.MAITRE_APP) {
            assignments = await Assignment.findByMaitreId(userId);
        }
        // Tuteur voit ses étudiants
        else if (userRole === USER_ROLES.TUTEUR_ECOLE) {
            assignments = await Assignment.findByTuteurId(userId);
        }
        // Étudiant voit son assignation
        else {
            const assignment = await Assignment.findByStudentId(userId);
            assignments = assignment ? [assignment] : [];
        }

        res.json({
            success: true,
            data: assignments,
            count: assignments.length
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des assignations:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir une assignation par ID
const getAssignmentById = async (req, res) => {
    try {
        const assignmentId = parseInt(req.params.id);
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        // Vérifier les permissions
        const userRole = req.user.role;
        const userId = req.user.userId;

        if (
            userRole !== USER_ROLES.ADMIN &&
            assignment.student_id !== userId &&
            assignment.maitre_id !== userId &&
            assignment.tuteur_id !== userId
        ) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        res.json({
            success: true,
            data: assignment
        });

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'assignation:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Créer une nouvelle assignation
const createAssignment = async (req, res) => {
    try {
        const { studentId, maitreId, tuteurId } = req.body;

        // Validation
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'L\'ID de l\'étudiant est requis'
            });
        }

        // Vérifier que l'étudiant existe et est bien un étudiant
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }

        if (!['ALTERNANT', 'ETUDIANT_CLASSIQUE'].includes(student.role)) {
            return res.status(400).json({
                success: false,
                message: 'L\'utilisateur doit être un étudiant'
            });
        }

        // Vérifier que l'étudiant n'a pas déjà une assignation
        const existingAssignment = await Assignment.existsForStudent(studentId);
        if (existingAssignment) {
            return res.status(400).json({
                success: false,
                message: 'Cet étudiant a déjà une assignation'
            });
        }

        // Vérifier que le maître existe si fourni
        if (maitreId) {
            const maitre = await User.findById(maitreId);
            if (!maitre || maitre.role !== USER_ROLES.MAITRE_APP) {
                return res.status(400).json({
                    success: false,
                    message: 'Maître d\'apprentissage invalide'
                });
            }
        }

        // Vérifier que le tuteur existe et n'a pas déjà 2 étudiants
        if (tuteurId) {
            const tuteur = await User.findById(tuteurId);
            if (!tuteur || tuteur.role !== USER_ROLES.TUTEUR_ECOLE) {
                return res.status(400).json({
                    success: false,
                    message: 'Tuteur d\'école invalide'
                });
            }

            const tuteurStudentCount = await Assignment.countByTuteurId(tuteurId);
            if (tuteurStudentCount >= 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Ce tuteur a déjà 2 étudiants assignés'
                });
            }
        }

        // Créer l'assignation
        const newAssignment = await Assignment.create({
            studentId,
            maitreId: maitreId || null,
            tuteurId: tuteurId || null
        });

        res.status(201).json({
            success: true,
            message: 'Assignation créée avec succès',
            data: newAssignment
        });

    } catch (error) {
        console.error('Erreur lors de la création de l\'assignation:', error);

        // Erreur de trigger (tuteur avec 2 étudiants)
        if (error.message && error.message.includes('plus de 2 étudiants')) {
            return res.status(400).json({
                success: false,
                message: 'Ce tuteur a déjà 2 étudiants assignés'
            });
        }

        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Mettre à jour une assignation
const updateAssignment = async (req, res) => {
    try {
        const assignmentId = parseInt(req.params.id);
        const { maitreId, tuteurId } = req.body;

        // Vérifier que l'assignation existe
        const existingAssignment = await Assignment.findById(assignmentId);
        if (!existingAssignment) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        // Vérifier le maître si fourni
        if (maitreId !== undefined) {
            if (maitreId !== null) {
                const maitre = await User.findById(maitreId);
                if (!maitre || maitre.role !== USER_ROLES.MAITRE_APP) {
                    return res.status(400).json({
                        success: false,
                        message: 'Maître d\'apprentissage invalide'
                    });
                }
            }
        }

        // Vérifier le tuteur si fourni
        if (tuteurId !== undefined) {
            if (tuteurId !== null) {
                const tuteur = await User.findById(tuteurId);
                if (!tuteur || tuteur.role !== USER_ROLES.TUTEUR_ECOLE) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tuteur d\'école invalide'
                    });
                }

                // Vérifier la charge du tuteur (sauf si c'est déjà son tuteur)
                if (tuteurId !== existingAssignment.tuteur_id) {
                    const tuteurStudentCount = await Assignment.countByTuteurId(tuteurId);
                    if (tuteurStudentCount >= 2) {
                        return res.status(400).json({
                            success: false,
                            message: 'Ce tuteur a déjà 2 étudiants assignés'
                        });
                    }
                }
            }
        }

        // Mettre à jour
        const updates = {};
        if (maitreId !== undefined) updates.maitre_id = maitreId;
        if (tuteurId !== undefined) updates.tuteur_id = tuteurId;

        const updatedAssignment = await Assignment.update(assignmentId, updates);

        res.json({
            success: true,
            message: 'Assignation mise à jour avec succès',
            data: updatedAssignment
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'assignation:', error);

        // Erreur de trigger
        if (error.message && error.message.includes('plus de 2 étudiants')) {
            return res.status(400).json({
                success: false,
                message: 'Ce tuteur a déjà 2 étudiants assignés'
            });
        }

        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Supprimer une assignation
const deleteAssignment = async (req, res) => {
    try {
        const assignmentId = parseInt(req.params.id);

        // Vérifier que l'assignation existe
        const existingAssignment = await Assignment.findById(assignmentId);
        if (!existingAssignment) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        await Assignment.delete(assignmentId);

        res.json({
            success: true,
            message: 'Assignation supprimée avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la suppression de l\'assignation:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir les statistiques des assignations
const getAssignmentStats = async (req, res) => {
    try {
        const stats = await Assignment.getStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir les étudiants non assignés
const getUnassignedStudents = async (req, res) => {
    try {
        const students = await Assignment.getUnassignedStudents();

        res.json({
            success: true,
            data: students,
            count: students.length
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des étudiants non assignés:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir les maîtres disponibles
const getAvailableMaitres = async (req, res) => {
    try {
        const maitres = await Assignment.getAvailableMaitres();

        res.json({
            success: true,
            data: maitres,
            count: maitres.length
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des maîtres:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir les tuteurs disponibles
const getAvailableTuteurs = async (req, res) => {
    try {
        const tuteurs = await Assignment.getAvailableTuteurs();

        res.json({
            success: true,
            data: tuteurs,
            count: tuteurs.length
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des tuteurs:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Obtenir l'assignation de l'utilisateur connecté (étudiant)
const getMyAssignment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const assignment = await Assignment.findByStudentId(userId);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Aucune assignation trouvée'
            });
        }

        res.json({
            success: true,
            data: assignment
        });

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'assignation:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

module.exports = {
    getAllAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentStats,
    getUnassignedStudents,
    getAvailableMaitres,
    getAvailableTuteurs,
    getMyAssignment
};
