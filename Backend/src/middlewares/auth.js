const jwt = require('jsonwebtoken');
const { ERROR_MESSAGES } = require('../config/constants');
const User = require('../models/User');
const { parseCookies } = require('../utils/cookies');

// Middleware pour vérifier le JWT
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const cookies = parseCookies(req.headers.cookie || '');
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (cookies.access_token) {
            token = cookies.access_token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED
            });
        }

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Vérifier que l'utilisateur existe toujours
        const user = await User.findById(decoded.userId);

        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED
            });
        }

        // Ajouter l'utilisateur à la requête
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            firstname: user.firstname,
            lastname: user.lastname
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.TOKEN_EXPIRED
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_TOKEN
            });
        }

        console.error('Erreur d\'authentification:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Middleware optionnel (n'échoue pas si pas de token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const cookies = parseCookies(req.headers.cookie || '');
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (cookies.access_token) {
            token = cookies.access_token;
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (user && user.is_active) {
                req.user = {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    firstname: user.firstname,
                    lastname: user.lastname
                };
            }
        }

        next();
    } catch (error) {
        // On continue même si le token est invalide
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuth
};
