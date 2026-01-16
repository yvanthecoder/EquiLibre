const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const ClassModel = require('../models/Class');
const { ERROR_MESSAGES } = require('../config/constants');
const { parseCookies } = require('../utils/cookies');

const getCookieOptions = (maxAgeMs) => ({
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAgeMs,
    path: '/'
});

// GAcnAcrer un JWT access
const generateAccessToken = (userId, email, role) => {
    return jwt.sign(
        { userId, email, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
    );
};

// GAcnAcrer un JWT refresh
const generateRefreshToken = (userId, email, role) => {
    return jwt.sign(
        { userId, email, role, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );
};

const setAuthCookies = (res, accessToken, refreshToken) => {
    const accessMaxAge = 15 * 60 * 1000;
    const refreshMaxAge = 7 * 24 * 60 * 60 * 1000;
    res.cookie('access_token', accessToken, getCookieOptions(accessMaxAge));
    res.cookie('refresh_token', refreshToken, getCookieOptions(refreshMaxAge));
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
            jobTitle,
            classId
        } = req.body;

        if (!email || !password || !firstname || !lastname || !role) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'Tous les champs obligatoires doivent A�tre remplis'
            });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.EMAIL_EXISTS
            });
        }

        const user = await User.create({
            email,
            password,
            firstname,
            lastname,
            role,
            company,
            phone,
            job_title: jobTitle,
            class_id: classId ? parseInt(classId, 10) : null
        });

        // Associer A� la classe principale si fournie
        if (classId) {
            try {
                await ClassModel.addMember(parseInt(classId, 10), user.id);
            } catch (err) {
                console.warn('Impossible d\'associer la classe lors de l\'inscription:', err.message);
            }
        }

        const accessToken = generateAccessToken(user.id, user.email, user.role);
        const refreshToken = generateRefreshToken(user.id, user.email, user.role);
        setAuthCookies(res, accessToken, refreshToken);

        return res.status(201).json({
            success: true,
            message: 'Utilisateur crAcAc avec succA"s',
            data: {
                token: accessToken,
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
        return res.status(500).json({
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

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST,
                detail: 'Email et mot de passe requis'
            });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        const isValidPassword = await User.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Compte dAcsactivAc'
            });
        }

        await User.updateLastLogin(user.id);

        const accessToken = generateAccessToken(user.id, user.email, user.role);
        const refreshToken = generateRefreshToken(user.id, user.email, user.role);
        setAuthCookies(res, accessToken, refreshToken);

        return res.json({
            success: true,
            message: 'Connexion rAcussie',
            data: {
                token: accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    role: user.role,
                    company: user.company,
                    phone: user.phone,
                    profile_picture: user.profile_picture,
                    class_id: user.class_id
                }
            }
        });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Obtenir le profil de l'utilisateur connectAc
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        return res.json({
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
                class_id: user.class_id,
                created_at: user.created_at,
                last_login: user.last_login
            }
        });

    } catch (error) {
        console.error('Erreur lors de la rAccupAcration du profil:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Mettre A� jour le profil
const updateProfile = async (req, res) => {
    try {
        const { firstname, lastname, phone, company, profile_picture, job_title, class_id } = req.body;

        const updatedUser = await User.update(req.user.userId, {
            firstname,
            lastname,
            phone,
            company,
            profile_picture,
            job_title,
            class_id
        });

        return res.json({
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstname,
            lastName: updatedUser.lastname,
            role: updatedUser.role,
            company: updatedUser.company,
            phone: updatedUser.phone,
            avatar: updatedUser.profile_picture,
            jobTitle: updatedUser.job_title,
            classId: updatedUser.class_id
        });

    } catch (error) {
        console.error('Erreur lors de la mise A� jour du profil:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            detail: error.message
        });
    }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.BAD_REQUEST
            });
        }

        const user = await User.findByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.NOT_FOUND
            });
        }

        const isValid = await User.verifyPassword(oldPassword, user.password);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Ancien mot de passe incorrect'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update(user.id, { password: hashedPassword });

        return res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// Rafraichir un token
const refreshToken = async (req, res) => {
    const cookies = parseCookies(req.headers.cookie || '');
    const refresh_token = req.body?.refresh_token || cookies.refresh_token;
    if (!refresh_token) {
        return res.status(400).json({ success: false, message: 'refresh_token manquant' });
    }

    try {
        let payload;
        try {
            payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: ERROR_MESSAGES.INVALID_TOKEN });
        }

        if (payload.type && payload.type !== 'refresh') {
            return res.status(401).json({ success: false, message: ERROR_MESSAGES.INVALID_TOKEN });
        }

        const newToken = generateAccessToken(payload.userId, payload.email, payload.role);
        const newRefresh = generateRefreshToken(payload.userId, payload.email, payload.role);
        setAuthCookies(res, newToken, newRefresh);
        return res.json({
            access_token: newToken,
            refresh_token: newRefresh
        });
    } catch (error) {
        console.error('Erreur lors du refresh token:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

// DAcconnexion
const logout = async (_req, res) => {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return res.json({ success: true });
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    refreshToken,
    logout
};
