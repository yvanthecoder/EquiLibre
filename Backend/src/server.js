require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/database');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Initialiser l'application Express
const app = express();

// =============================================
// MIDDLEWARES
// =============================================

// CORS - Autoriser les requêtes depuis le frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger les requêtes (en développement)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`, {
            body: req.body,
            params: req.params,
            query: req.query
        });
        next();
    });
}

// =============================================
// ROUTES
// =============================================

// Route de base
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API EquiLibre - Backend',
        version: '1.0.0',
        documentation: '/api/docs'
    });
});

// Health check
app.get('/health', async (req, res) => {
    try {
        // Tester la connexion à la base de données
        await pool.query('SELECT 1');

        res.json({
            success: true,
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/messages', messageRoutes);

// =============================================
// GESTION DES ERREURS
// =============================================

// Route 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée',
        path: req.path
    });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error('Erreur globale:', err);

    // Erreur de validation
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors: err.errors
        });
    }

    // Erreur PostgreSQL
    if (err.code && err.code.startsWith('23')) {
        return res.status(400).json({
            success: false,
            message: 'Erreur de base de données',
            detail: err.detail || err.message
        });
    }

    // Erreur générique
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erreur serveur interne',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// =============================================
// DÉMARRAGE DU SERVEUR
// =============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Tester la connexion à la base de données
        await pool.query('SELECT NOW()');
        console.log('  Connexion à PostgreSQL réussie');

        // Démarrer le serveur
        app.listen(PORT, () => {
            console.log('╔═══════════════════════════════════════╗');
            console.log('║     SERVEUR EQUILIBRE DÉMARRÉ       ║');
            console.log('╚═══════════════════════════════════════╝');
            console.log(`  Port: ${PORT}`);
            console.log(`  Environnement: ${process.env.NODE_ENV || 'development'}`);
            console.log(`  URL: http://localhost:${PORT}`);
            console.log(`  Documentation: http://localhost:${PORT}/api/docs`);
            console.log('═════════════════════════════════════════');
        });

    } catch (error) {
        console.error('  Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
};

// Gestion de l'arrêt propre
process.on('SIGTERM', async () => {
    console.log('   SIGTERM reçu, arrêt du serveur...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n   SIGINT reçu, arrêt du serveur...');
    await pool.end();
    process.exit(0);
});

// Démarrer le serveur
startServer();

module.exports = app;
