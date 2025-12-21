const testAssistant = async () => {
  try {
    // 1. Se connecter pour obtenir un token valide
    console.log('1. Connexion...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@equilibre.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.data?.token || loginData.token;

    if (!token) {
      console.error('Erreur de connexion:', loginData);
      return;
    }

    console.log('✅ Connexion réussie');
    console.log('Token:', token.substring(0, 50) + '...');

    // 2. Tester l'assistant
    console.log('\n2. Test de l\'assistant...');
    const assistantResponse = await fetch('http://localhost:5001/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userMessage: 'Bonjour, comment puis-je soumettre une exigence?',
      }),
    });

    const assistantData = await assistantResponse.json();
    console.log('\n=== Réponse de l\'assistant ===');
    console.log('Success:', assistantData.success);
    console.log('Message:', assistantData.message || assistantData.error);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

testAssistant();
