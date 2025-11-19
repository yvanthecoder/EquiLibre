/**
 * Script d'initialisation de la base de données
 *
 * Ce script permet de :
 * 1. Créer la base de données
 * 2. Exécuter le schéma (tables, types, indexes)
 * 3. Optionnellement insérer des données de test
 *
 * Usage:
 * node src/utils/dbInit.js [--seed]
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Créer une connexion pour créer la base de données
const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Base par défaut
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

// Pool pour la base de données de l'application
const appPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'equilibre_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

async function createDatabase() {
    const dbName = process.env.DB_NAME || 'equilibre_db';

    try {
        console.log(`🔍 Vérification de l'existence de la base de données ${dbName}...`);

        // Vérifier si la base existe
        const result = await adminPool.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [dbName]
        );

        if (result.rows.length === 0) {
            console.log(`📦 Création de la base de données ${dbName}...`);
            await adminPool.query(`CREATE DATABASE ${dbName}`);
            console.log(`  Base de données ${dbName} créée avec succès`);
        } else {
            console.log(`  La base de données ${dbName} existe déjà`);
        }

    } catch (error) {
        console.error('  Erreur lors de la création de la base de données:', error.message);
        throw error;
    }
}

async function runSchema() {
    try {
        console.log('📄 Exécution du schéma de la base de données...');

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await appPool.query(schema);

        console.log('  Schéma exécuté avec succès');
    } catch (error) {
        console.error('  Erreur lors de l\'exécution du schéma:', error.message);
        throw error;
    }
}

async function runSeed() {
    try {
        console.log('🌱 Insertion des données de test...');

        const seedPath = path.join(__dirname, '../database/seed.sql');
        const seed = fs.readFileSync(seedPath, 'utf8');

        await appPool.query(seed);

        console.log('  Données de test insérées avec succès');
    } catch (error) {
        console.error('  Erreur lors de l\'insertion des données:', error.message);
        throw error;
    }
}

async function init() {
    const shouldSeed = process.argv.includes('--seed');

    try {
        console.log('╔═══════════════════════════════════════╗');
        console.log('║  INITIALISATION DE LA BASE DE DONNÉES ║');
        console.log('╚═══════════════════════════════════════╝\n');

        // 1. Créer la base de données
        await createDatabase();

        // 2. Exécuter le schéma
        await runSchema();

        // 3. Insérer les données de test (optionnel)
        if (shouldSeed) {
            await runSeed();
        } else {
            console.log('ℹ️  Pour insérer des données de test, utilisez: node src/utils/dbInit.js --seed');
        }

        console.log('\n  Initialisation terminée avec succès!');

    } catch (error) {
        console.error('\n  Échec de l\'initialisation:', error);
        process.exit(1);
    } finally {
        await adminPool.end();
        await appPool.end();
    }
}

// Exécuter l'initialisation
init();
