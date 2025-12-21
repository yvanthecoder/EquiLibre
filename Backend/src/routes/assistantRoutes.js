const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');

/**
 * @route   POST /api/assistant/chat
 * @desc    Envoyer un message à l'assistant IA (proxy vers Ollama)
 * @access  Private (tous les utilisateurs authentifiés)
 */
router.post('/chat', authenticate, async (req, res) => {
    try {
        const { messages, userMessage } = req.body;

        if (!userMessage) {
            return res.status(400).json({
                success: false,
                message: 'Le message utilisateur est requis'
            });
        }

        // Construire le contexte système pour l'assistant
        const systemContext = `Tu es l'assistant virtuel de la plateforme EquiLibre, une plateforme de gestion pour l'alternance et les études.

Tu aides les utilisateurs (étudiants alternants, étudiants classiques, tuteurs école, maîtres d'apprentissage et administrateurs) à :
- Comprendre comment utiliser la plateforme
- Soumettre et gérer des exigences (documents requis)
- Envoyer des messages à leur tuteur ou maître d'apprentissage
- Consulter leur calendrier et événements
- Télécharger et partager des fichiers
- Gérer leur profil
- Comprendre leur rôle et leurs responsabilités

Principales fonctionnalités de la plateforme :
1. Dashboard : Vue d'ensemble personnalisée selon le rôle
2. Profil : Gestion des informations personnelles
3. Ma Classe : Vue de la classe (pour étudiants/alternants)
4. Exigences : Soumission de documents requis
5. Mes Fichiers : Gestion des documents
6. Calendrier : Événements et deadlines
7. Messages : Communication entre utilisateurs
8. Annuaire : Liste des utilisateurs de la plateforme

Réponds de manière claire, concise et amicale. Si tu ne connais pas la réponse exacte, oriente l'utilisateur vers la bonne section ou suggère de contacter un administrateur.`;

        // Construire l'historique des messages pour Ollama
        const ollamaMessages = [
            { role: 'system', content: systemContext },
            ...(messages || []),
            { role: 'user', content: userMessage }
        ];

        // Appel API Ollama local
        const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'mistral',
                messages: ollamaMessages,
                stream: false,
            }),
        });

        if (!ollamaResponse.ok) {
            throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);
        }

        const ollamaData = await ollamaResponse.json();

        // Extraire la réponse de l'assistant
        const assistantMessage = ollamaData.message?.content || ollamaData.response || "Désolé, je n'ai pas pu générer une réponse.";

        return res.json({
            success: true,
            message: assistantMessage,
            response: assistantMessage // Pour compatibilité
        });

    } catch (error) {
        console.error('Erreur assistant:', error);

        // Message d'erreur spécifique si Ollama n'est pas accessible
        if (error.code === 'ECONNREFUSED' || error.message.includes('fetch')) {
            return res.status(503).json({
                success: false,
                message: 'Le service d\'IA n\'est pas disponible. Veuillez vous assurer qu\'Ollama est démarré (localhost:11434).',
                error: 'Service IA indisponible'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la communication avec l\'assistant',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/assistant/status
 * @desc    Vérifier si le service Ollama est disponible
 * @access  Private
 */
router.get('/status', authenticate, async (req, res) => {
    try {
        const ollamaResponse = await fetch('http://localhost:11434/api/tags');

        if (ollamaResponse.ok) {
            const data = await ollamaResponse.json();
            return res.json({
                success: true,
                status: 'online',
                models: data.models || []
            });
        } else {
            return res.json({
                success: false,
                status: 'offline',
                message: 'Ollama est inaccessible'
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            status: 'offline',
            message: 'Ollama n\'est pas démarré',
            error: error.message
        });
    }
});

module.exports = router;
