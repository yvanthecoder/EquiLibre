const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ERROR_MESSAGES } = require('../config/constants');

// Générer un JWT
const generateToken = (userId, email, role) => {
    return jwt.sign(
        { userId, email, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Inscription
const register = async (req, res) => {
    try {
        const {
            email,
            password,
            firstname,
            lastname,
            role,
            company,
            phone,
            jobTitle,      // Nouveau champ
            classId        // Nouveau champ
        } = req.body;

        // Validation basique
        if (!email || !password || !firstname || !lastname || !role) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        // Validations spécifiques par rôle
        if (role === 'ALTERNANT') {
            if (!company || !jobTitle || !classId) {
                return res.status(400).json({
                    success: false,
                    message: 'Pour un alternant: entreprise, poste et classe sont requis'
                });
            }
        }

        if (role === 'MAITRE_APP') {
            if (!company || !jobTitle) {
                return res.status(400).json({
                    success: false,
                    message: 'Pour un maître d\'apprentissage: entreprise et poste sont requis'
                });
            }
        }

        if (role === 'ETUDIANT_CLASSIQUE' && !classId) {
            return res.status(400).json({
                success: false,
                message: 'Pour un étudiant: la classe est requise'
            });
        }

        // Vérifier si l'email existe déjà
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.EMAIL_EXISTS
            });
        }

        // Créer l'utilisateur
        const user = await User.create({
            email,
            password,
            firstname,
            lastname,
            role,
            company,
            phone,
            job_title: jobTitle,
            class_id: classId ? parseInt(classId) : null
        });

        // Générer le token
        const token = generateToken(user.id, user.email, user.role);

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    role: user.role,
                    company: user.company,
                    job_title: user.job_title,
                    class_id: user.class_id
                }
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Connexion
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'Email et mot de passe requis'
            });
        }

        // Trouver l'utilisateur
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        // Vérifier le mot de passe
        const isValidPassword = await User.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        // Vérifier que le compte est actif
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Compte désactivé'
            });
        }

        // Mettre à jour la dernière connexion
        await User.updateLastLogin(user.id);

        // Générer le token
        const token = generateToken(user.id, user.email, user.role);

        res.json({
            success: true,
            message: 'Connexion réussie',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    role: user.role,
                    company: user.company,
                    phone: user.phone,
                    profile_picture: user.profile_picture
                }
            }
        });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Obtenir le profil de l'utilisateur connecté
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                role: user.role,
                company: user.company,
                phone: user.phone,
                profile_picture: user.profile_picture,
                created_at: user.created_at,
                last_login: user.last_login
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Mettre à jour le profil
const updateProfile = async (req, res) => {
    try {
        const { firstname, lastname, phone, company, profile_picture } = req.body;

        const updatedUser = await User.update(req.user.userId, {
            firstname,
            lastname,
            phone,
            company,
            profile_picture
        });

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: updatedUser
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile
};
