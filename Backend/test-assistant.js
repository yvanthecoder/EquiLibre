const jwt = require('jsonwebtoken');

// Générer un token valide
const token = jwt.sign(
  { userId: 4, email: 'etudiant.e3e@equilibre.fr', role: 'ETUDIANT_CLASSIQUE' },
  'your-secret-key-change-this-in-production',
  { expiresIn: '24h' }
);

console.log('Token:', token);

// Test de l'API assistant
const testAssistant = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userMessage: 'Bonjour, comment puis-je soumettre une exigence?',
      }),
    });

    const data = await response.json();
    console.log('\n=== Réponse de l\'assistant ===');
    console.log('Success:', data.success);
    console.log('Message:', data.message);

  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

testAssistant();
