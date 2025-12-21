const bcrypt = require('bcrypt');

// Le hash actuel dans la base de données
const hashInDB = '$2b$10$QFgV3ZPcTJUadqW.Ch4P7.O7Zm1HE0EbQRr/ndADnrH1qdJTOxEka';

// Liste des mots de passe à tester
const passwordsToTest = [
    'password123',
    'Password123',
    'Equilibre2024!',
    'admin123',
    'test123'
];

console.log('=== TEST DES MOTS DE PASSE ===\n');

passwordsToTest.forEach(async (password) => {
    const isValid = await bcrypt.compare(password, hashInDB);
    console.log(`${password.padEnd(20)} -> ${isValid ? '✅ VALIDE' : '❌ INVALIDE'}`);
});

// Générer un nouveau hash pour "password123"
setTimeout(async () => {
    console.log('\n=== GÉNÉRATION DE NOUVEAUX HASH ===\n');
    const newHash = await bcrypt.hash('password123', 10);
    console.log('Nouveau hash pour "password123":');
    console.log(newHash);
}, 500);
