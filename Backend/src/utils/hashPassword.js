/**
 * Script pour générer des hashs bcrypt
 * Usage: node src/utils/hashPassword.js <password>
 */

const bcrypt = require('bcrypt');

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    return hash;
}

const password = process.argv[2] || 'password123';
hashPassword(password);
