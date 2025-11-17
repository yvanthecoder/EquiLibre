const { Pool } = require('pg');
require('dotenv').config();

// Configuration de la connexion PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'equilibre_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',

    // Options de connexion
    max: 20, // Nombre maximum de clients dans le pool
    idleTimeoutMillis: 30000, // Temps avant qu'un client inactif soit fermé
    connectionTimeoutMillis: 2000, // Temps d'attente maximum pour obtenir une connexion
});

// Test de connexion
pool.on('connect', () => {
    console.log('  Connecté à PostgreSQL');
});

pool.on('error', (err) => {
    console.error('  Erreur PostgreSQL inattendue:', err);
    process.exit(-1);
});

// Fonction utilitaire pour exécuter des requêtes
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Requête exécutée', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Erreur lors de l\'exécution de la requête:', error);
        throw error;
    }
};

// Fonction pour obtenir un client du pool (pour les transactions)
const getClient = async () => {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);

    // Timeout pour éviter les deadlocks
    const timeout = setTimeout(() => {
        console.error('Un client n\'a pas été libéré après 5 secondes!');
    }, 5000);

    client.release = () => {
        clearTimeout(timeout);
        client.release();
    };

    return { query, release };
};

module.exports = {
    pool,
    query,
    getClient
};
