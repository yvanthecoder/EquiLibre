# Documentation API - EquiLibre

## URL de base
```
http://localhost:5001
```

## Identifiants de test

Tous les utilisateurs utilisent le mot de passe : `password123`

### Admin
- Email: `admin@equilibre.com`
- Mot de passe: `password123`
- Rôle: ADMIN

### Tuteurs École
- Email: `tuteur1@equilibre.com`
- Mot de passe: `password123`
- Rôle: TUTEUR_ECOLE

- Email: `tuteur2@equilibre.com`
- Mot de passe: `password123`
- Rôle: TUTEUR_ECOLE

### Maîtres d'Apprentissage
- Email: `maitre1@entreprise.com`
- Mot de passe: `password123`
- Rôle: MAITRE_APP

- Email: `maitre2@entreprise.com`
- Mot de passe: `password123`
- Rôle: MAITRE_APP

### Alternants
- Email: `alternant1@student.com`
- Mot de passe: `password123`
- Rôle: ALTERNANT
- Classe: E3A (ID: 6)

- Email: `alternant2@student.com`
- Mot de passe: `password123`
- Rôle: ALTERNANT
- Classe: E4A (ID: 7)

### Étudiants Classiques
- Email: `etudiant1@student.com`
- Mot de passe: `password123`
- Rôle: ETUDIANT_CLASSIQUE
- Classe: E3E (ID: 3)

- Email: `etudiant2@student.com`
- Mot de passe: `password123`
- Rôle: ETUDIANT_CLASSIQUE
- Classe: E4E (ID: 4)

## Classes disponibles

| ID | Nom | Description | Niveau |
|----|-----|-------------|--------|
| 1 | Prepa 1 | Première année préparatoire | PREPA1 |
| 2 | Prepa 2 | Deuxième année préparatoire | PREPA2 |
| 3 | E3E | Troisième année - Étudiants classiques | E3 |
| 4 | E4E | Quatrième année - Étudiants classiques | E4 |
| 5 | E5E | Cinquième année - Étudiants classiques | E5 |
| 6 | E3A | Troisième année - Alternance | E3 |
| 7 | E4A | Quatrième année - Alternance | E4 |
| 8 | E5A | Cinquième année - Alternance | E5 |

## Exemples d'API

### 1. Connexion (Login)
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alternant1@student.com",
    "password": "password123"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 6,
      "email": "alternant1@student.com",
      "firstname": "Lucas",
      "lastname": "Petit",
      "role": "ALTERNANT",
      "company": "Tech Corp"
    }
  }
}
```

### 2. Inscription (Register)
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau@student.com",
    "password": "monMotDePasse123",
    "firstname": "Jean",
    "lastname": "Dupont",
    "role": "ALTERNANT",
    "company": "Ma Société",
    "jobTitle": "Développeur",
    "classId": 6
  }'
```

**Réponse :**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 10,
      "email": "nouveau@student.com",
      "firstname": "Jean",
      "lastname": "Dupont",
      "role": "ALTERNANT",
      "class_id": 6
    }
  }
}
```

### 3. Récupérer les classes disponibles (Public)
```bash
curl http://localhost:5001/api/classes/available
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Prepa 1",
      "description": "Première année préparatoire",
      "year": "2024-2025",
      "level": "PREPA1"
    },
    {
      "id": 6,
      "name": "E3A",
      "description": "Troisième année - Alternance",
      "year": "2024-2025",
      "level": "E3"
    }
  ]
}
```

### 4. Obtenir le profil utilisateur (Authentifié)
```bash
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### 5. Récupérer toutes les classes (Authentifié)
```bash
curl http://localhost:5001/api/classes \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### 6. Health Check
```bash
curl http://localhost:5001/health
```

**Réponse :**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

## Rôles disponibles

Les rôles suivants sont disponibles lors de l'inscription :
- `ALTERNANT` - Pour les alternants
- `ETUDIANT_CLASSIQUE` - Pour les étudiants en formation classique
- `MAITRE_APP` - Pour les maîtres d'apprentissage
- `TUTEUR_ECOLE` - Pour les tuteurs école
- `ADMIN` - Pour les administrateurs (uniquement créable via la base de données)

## Notes importantes

1. **Mot de passe par défaut** : Tous les utilisateurs de test utilisent `password123`
2. **Token JWT** : Le token d'authentification expire après 7 jours
3. **Classes** : Lors de l'inscription, l'utilisateur peut sélectionner une classe via le paramètre `classId`
4. **CORS** : Le frontend est configuré pour fonctionner sur `http://localhost:5174`

## Démarrage rapide

1. Démarrer le serveur :
```bash
./start.sh
# ou
npm run dev
```

2. Réinitialiser la base de données :
```bash
npm run db:init -- --seed
```

3. Tester la connexion :
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alternant1@student.com","password":"password123"}'
```
