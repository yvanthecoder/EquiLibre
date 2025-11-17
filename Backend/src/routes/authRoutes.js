const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Mettre à jour son propre profil
 * @access  Private
 */
router.put('/profile', authenticate, updateProfile);

module.exports = router;
