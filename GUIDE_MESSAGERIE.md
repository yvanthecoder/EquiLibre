# Guide de Test - Système de Messagerie EquiLibre

## Vérification Backend

### 1. Base de Données
Les tables suivantes ont été créées :
- `conversations` - Stocke les conversations
- `conversation_participants` - Relie les utilisateurs aux conversations
- `messages` - Stocke tous les messages

### 2. Endpoints Backend Disponibles

Tous les endpoints nécessitent un token d'authentification valide.

```
GET    /api/messages/users                           - Liste de tous les utilisateurs
GET    /api/messages/conversations                   - Toutes les conversations de l'utilisateur
GET    /api/messages/conversations/:id               - Info d'une conversation
GET    /api/messages/conversations/:id/messages      - Messages d'une conversation
POST   /api/messages/conversations                   - Créer une conversation
POST   /api/messages/messages                        - Envoyer un message
PATCH  /api/messages/conversations/:id/read          - Marquer comme lu
GET    /api/messages/unread-count                    - Nombre de messages non lus
DELETE /api/messages/messages/:id                    - Supprimer un message
```

### 3. Test Manuel des Endpoints

#### A. Connexion et obtention du token
```bash
curl -X POST "http://localhost:5001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@equilibre.com","password":"VOTRE_MOT_DE_PASSE"}'
```

Copier le token retourné dans `data.token`

#### B. Tester l'endpoint users
```bash
TOKEN="VOTRE_TOKEN_ICI"

curl -X GET "http://localhost:5001/api/messages/users" \
  -H "Authorization: Bearer $TOKEN"
```

Vous devriez voir la liste de tous les utilisateurs sauf vous-même.

## Utilisation Frontend

### 1. Connexion
1. Ouvrir http://localhost:5173
2. Se connecter avec vos identifiants
3. Vérifier dans la console du navigateur (F12) que le token est bien stocké :
   ```javascript
   localStorage.getItem('access_token')
   ```

### 2. Accéder à la Messagerie
1. Cliquer sur "Messagerie" dans le menu
2. Vous verrez la liste de vos conversations

### 3. Créer une Nouvelle Conversation
1. Cliquer sur le bouton "Nouveau message"
2. Un popup s'ouvre avec la liste des utilisateurs
3. **Si la liste est vide**, ouvrir la console (F12) et vérifier :
   - Y a-t-il des erreurs ?
   - Le message "Fetching users..." apparaît-il ?
   - Quelle est l'erreur retournée ?

### 4. Envoyer un Message
1. Sélectionner un utilisateur dans la liste
2. Écrire votre message
3. Cliquer sur "Envoyer"
4. Vous serez redirigé vers la conversation

### 5. Temps Réel
- Les conversations se rafraîchissent automatiquement toutes les 10 secondes
- Les messages dans une conversation se rafraîchissent toutes les 5 secondes

## Dépannage

### Problème : Liste des utilisateurs vide

#### Vérification 1 : Token valide ?
```javascript
// Dans la console du navigateur (F12)
console.log('Token:', localStorage.getItem('access_token'));
```

Si null ou undefined, se reconnecter.

#### Vérification 2 : Backend répond ?
```bash
# Test direct avec curl
TOKEN="VOTRE_TOKEN"
curl -X GET "http://localhost:5001/api/messages/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

#### Vérification 3 : Utilisateurs dans la DB ?
```bash
psql -U yvandjopa -d equilibre_db -c "SELECT COUNT(*) FROM users;"
```

Devrait retourner au moins 2 utilisateurs.

#### Vérification 4 : Logs backend
Les logs du backend afficheront :
```
getAllUsers called by user: { id: X, email: '...', role: '...' }
Found users: N
```

Si vous ne voyez pas ces logs, l'endpoint n'est pas appelé.

### Problème : Erreur 401 Non autorisé

Votre token a expiré. Déconnectez-vous et reconnectez-vous.

### Problème : Frontend ne se connecte pas au backend

Vérifier que les variables d'environnement sont correctes :
```bash
# Dans Frontend/.env
VITE_API_URL=http://localhost:5001
```

## Architecture de la Messagerie

### Flux de Création de Conversation
1. User clique "Nouveau message"
2. Frontend appelle `GET /api/messages/users`
3. Backend retourne tous les users sauf l'utilisateur connecté
4. User sélectionne un destinataire et écrit un message
5. Frontend appelle `POST /api/messages/conversations` avec `{participantIds: [destinataireId]}`
6. Backend crée ou récupère la conversation existante
7. Frontend appelle `POST /api/messages/messages` avec `{conversationId, content}`
8. Backend enregistre le message et met à jour la conversation
9. Frontend redirige vers la conversation

### Flux de Lecture de Messages
1. User ouvre une conversation
2. Frontend appelle `GET /api/messages/conversations/:id/messages`
3. Backend retourne tous les messages
4. Frontend affiche les messages et scroll en bas
5. Frontend appelle `PATCH /api/messages/conversations/:id/read`
6. Backend met à jour `last_read_at`
7. Toutes les 5 secondes, frontend re-fetch les messages

## Logs de Debug

Les logs suivants ont été ajoutés pour le débogage :

### Backend (messageController.js)
```javascript
console.log('getAllUsers called by user:', req.user);
console.log('Found users:', result.rows.length);
```

### Frontend (NewMessageModal.tsx)
```javascript
console.log('Fetching users...');
console.log('Users fetched:', data);
console.log('Error response:', error.response?.data);
```

## Prochaines Étapes

Une fois que la liste des utilisateurs s'affiche correctement :

1. Tester l'envoi d'un message
2. Tester la réception d'un message (avec 2 navigateurs différents ou mode incognito)
3. Vérifier le compteur de messages non lus
4. Tester le marquage comme lu
5. Vérifier l'auto-refresh des messages

## Contact Support

En cas de problème persistant, fournir :
1. Capture d'écran de la console navigateur (F12 > Console)
2. Logs du serveur backend
3. Résultat des tests curl ci-dessus
