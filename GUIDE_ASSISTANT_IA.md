# 🤖 Guide - My Assistant (IA intégrée)

## Vue d'ensemble

J'ai intégré un assistant IA dans votre plateforme EquiLibre. Cet assistant utilise **Ollama** avec le modèle **Mistral** en local pour aider tous les utilisateurs à comprendre et utiliser la plateforme.

## ✨ Fonctionnalités

### Interface de chat moderne
- Interface type ChatGPT intuitive
- Historique des conversations
- Questions suggérées pour démarrer
- Réponses en temps réel

### Assistant intelligent
L'assistant peut aider avec :
- 📚 Navigation sur la plateforme
- 📝 Soumission d'exigences
- 💬 Utilisation de la messagerie
- 📅 Consultation du calendrier
- 📁 Gestion des fichiers
- 👥 Compréhension des rôles

### Accessible à tous
- **Tous les utilisateurs** peuvent utiliser l'assistant (étudiants, tuteurs, maîtres, admin)
- Disponible dans le menu principal sous "My Assistant"
- Icône avec étoiles ✨ pour le repérer facilement

## 🚀 Installation et configuration

### 1. Installer Ollama

```bash
# Sur macOS
brew install ollama

# Ou télécharger depuis https://ollama.ai
```

### 2. Télécharger le modèle Mistral

```bash
ollama pull mistral
```

### 3. Démarrer Ollama

```bash
# Démarrer le service Ollama
ollama serve

# Le service tourne maintenant sur http://localhost:11434
```

### 4. Vérifier que tout fonctionne

```bash
# Tester Ollama
curl http://localhost:11434/api/tags

# Vous devriez voir la liste des modèles installés
```

## 📂 Fichiers créés

### Frontend

**`/Frontend/src/pages/Assistant.tsx`**
- Composant React pour l'interface de chat
- Gère l'affichage des messages
- Questions suggérées
- Interface utilisateur moderne

**Modifications dans `/Frontend/src/App.tsx`**
- Ajout de la route `/assistant`
- Import du composant Assistant

**Modifications dans `/Frontend/src/components/Layout/Sidebar.tsx`**
- Ajout de "My Assistant" dans le menu
- Icône SparklesIcon

### Backend

**`/Backend/src/routes/assistantRoutes.js`**
- Route `/api/assistant/chat` - Envoyer un message à l'IA
- Route `/api/assistant/status` - Vérifier si Ollama est disponible
- Proxy vers Ollama localhost:11434
- Contexte système optimisé pour EquiLibre

**Modifications dans `/Backend/src/server.js`**
- Import des routes assistant
- Ajout de `app.use('/api/assistant', assistantRoutes)`

## 💡 Comment utiliser

### Pour les utilisateurs

1. **Se connecter à EquiLibre**
2. **Cliquer sur "My Assistant"** dans le menu (icône ✨)
3. **Poser une question** ou cliquer sur une question suggérée
4. **Attendre la réponse** de l'IA

### Questions suggérées (exemples)

- "Comment soumettre une exigence ?"
- "Comment envoyer un message à mon tuteur ?"
- "Où puis-je voir mon calendrier ?"
- "Comment télécharger mes fichiers ?"

### Exemples de conversations

```
User: Comment soumettre une exigence ?
Assistant: Pour soumettre une exigence, suivez ces étapes :
1. Allez dans la section "Exigences" du menu
2. Sélectionnez l'exigence que vous souhaitez soumettre
3. Cliquez sur le bouton "Soumettre"
4. Téléchargez votre fichier
5. Validez l'envoi
...
```

## 🔧 Configuration technique

### Contexte système de l'assistant

L'assistant est configuré avec un contexte spécifique à EquiLibre qui inclut :
- Description de la plateforme
- Liste des rôles (ALTERNANT, ETUDIANT_CLASSIQUE, TUTEUR_ECOLE, MAITRE_APP, ADMIN)
- Fonctionnalités principales
- Instructions pour répondre de manière claire et concise

### Architecture

```
Frontend (React)
    ↓
    Appel API /api/assistant/chat
    ↓
Backend (Express)
    ↓
    Proxy vers Ollama
    ↓
Ollama (localhost:11434)
    ↓
    Modèle Mistral
```

### Avantages de cette architecture

✅ **Sécurité** : Ollama tourne en local, pas d'envoi de données à l'extérieur
✅ **Performance** : Réponses rapides avec Mistral
✅ **Coût** : Gratuit, pas d'API externe payante
✅ **Personnalisation** : Contexte adapté à EquiLibre
✅ **Confidentialité** : Les conversations restent privées

## 🔍 Dépannage

### L'assistant ne répond pas

**Problème** : "Le service d'IA n'est pas disponible"

**Solution** :
```bash
# Vérifier qu'Ollama tourne
curl http://localhost:11434/api/tags

# Si ça ne fonctionne pas, démarrer Ollama
ollama serve
```

### Ollama n'est pas installé

```bash
# macOS
brew install ollama

# Linux
curl https://ollama.ai/install.sh | sh

# Windows
# Télécharger depuis https://ollama.ai
```

### Le modèle Mistral n'est pas téléchargé

```bash
# Télécharger Mistral
ollama pull mistral

# Vérifier les modèles installés
ollama list
```

### Erreur CORS

Si vous voyez une erreur CORS, vérifiez que le backend accepte bien le port du frontend :
```javascript
// Backend/src/server.js
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    // ...
];
```

## 🎯 Exemples d'utilisation par rôle

### Étudiant / Alternant
- "Comment voir mes exigences en attente ?"
- "Où trouver mon tuteur ?"
- "Comment télécharger un document ?"

### Tuteur École
- "Comment valider une exigence ?"
- "Où voir la liste de mes étudiants ?"
- "Comment créer un événement au calendrier ?"

### Maître d'Apprentissage
- "Comment suivre mon alternant ?"
- "Où voir les exigences soumises ?"
- "Comment envoyer un message à un étudiant ?"

### Admin
- "Comment créer un nouvel utilisateur ?"
- "Où gérer les classes ?"
- "Comment voir les statistiques ?"

## 📊 Statistiques et monitoring

Pour vérifier le statut d'Ollama :

```bash
# Via l'API backend
curl http://localhost:5001/api/assistant/status \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

**Réponse attendue** :
```json
{
  "success": true,
  "status": "online",
  "models": [
    {
      "name": "mistral",
      "size": 4109865159,
      ...
    }
  ]
}
```

## 🚀 Améliorations futures possibles

1. **Historique des conversations** : Sauvegarder en base de données
2. **Modèles alternatifs** : Support de Llama, GPT4All, etc.
3. **Analyse des questions** : Statistiques sur les questions fréquentes
4. **Suggestions proactives** : L'assistant propose de l'aide selon le contexte
5. **Multi-langues** : Support anglais/français
6. **Intégration RAG** : Recherche dans la documentation

## 📝 Notes importantes

- **Ollama doit être démarré** pour que l'assistant fonctionne
- Le modèle Mistral fait environ **4 GB** sur le disque
- Les réponses sont générées en **temps réel** (quelques secondes)
- L'assistant utilise le **contexte de conversation** pour des réponses cohérentes
- Tous les utilisateurs peuvent utiliser l'assistant, **pas besoin de droits spéciaux**

## ✅ Résumé de l'intégration

```
✅ Composant React Assistant créé
✅ Routes backend configurées
✅ Proxy vers Ollama opérationnel
✅ Menu de navigation mis à jour
✅ Routes dans App.tsx ajoutées
✅ Interface utilisateur moderne
✅ Questions suggérées
✅ Gestion d'erreurs
✅ Accessible à tous les rôles
```

## 🎉 Prêt à utiliser !

1. **Démarrez Ollama** : `ollama serve`
2. **Démarrez le backend** : Déjà en cours
3. **Démarrez le frontend** : Déjà en cours sur port 5174
4. **Connectez-vous** à EquiLibre
5. **Cliquez sur "My Assistant"** dans le menu
6. **Posez votre première question !** 🚀

L'assistant est maintenant intégré et prêt à aider vos utilisateurs ! 🎊
