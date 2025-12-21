# EquiLibre Backend API

Backend API Node.js/Express avec PostgreSQL pour la plateforme EquiLibre - Système de gestion avec 5 rôles utilisateurs.

##   Fonctionnalités

-   Authentification JWT sécurisée
-   Système de rôles à 5 niveaux (ALTERNANT, ETUDIANT_CLASSIQUE, MAITRE_APP, TUTEUR_ECOLE, ADMIN)
-   Gestion des utilisateurs
-   Gestion des classes
-   Gestion des requirements (exigences/livrables)
-   Permissions basées sur les rôles
-   Protection des routes par middleware
-   Base de données PostgreSQL

##   Prérequis

- Node.js (v16 ou supérieur)
- PostgreSQL (v12 ou supérieur)
- npm ou yarn

##   Installation

### 1. Installer les dépendances

```bash
cd Backend
npm install
```

### 2. Configurer les variables d'environnement

Copier le fichier `.env.example` en `.env` et configurer les valeurs :

```bash
cp .env.example .env
```

Éditer le fichier `.env` :

```env
PORT=5001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=equilibre_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:3000
```

### 3. Créer la base de données

**Option 1 : Initialisation complète avec données de test**

```bash
npm run db:seed
```

**Option 2 : Initialisation sans données de test**

```bash
npm run db:init
```

**Option 3 : Manuellement avec psql**

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE equilibre_db;

# Se connecter à la base
\c equilibre_db

# Exécuter le schéma
\i src/database/schema.sql

# (Optionnel) Insérer les données de test
\i src/database/seed.sql
```

## 🎮 Démarrage

### Mode développement (avec auto-reload)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

Le serveur démarre sur `http://localhost:5001`

## 🔐 Les 5 Rôles Utilisateurs

### 1. ALTERNANT
- Étudiant en alternance
- Peut voir ses requirements
- Peut accéder à ses classes
- Peut consulter ses notifications

### 2. ETUDIANT_CLASSIQUE
- Étudiant en cycle classique
- Peut voir ses requirements
- Peut accéder à ses classes
- Peut consulter ses notifications

### 3. MAITRE_APP
- Maître d'apprentissage (entreprise)
- Peut voir les données de ses apprentis
- Accès limité aux informations liées à son entreprise

### 4. TUTEUR_ECOLE
- Tuteur d'école
- Peut valider/refuser les requirements
- Peut gérer ses classes
- Peut voir tous les étudiants de ses classes

### 5. ADMIN
- Administrateur de la plateforme
- Accès complet à toutes les fonctionnalités
- Peut créer/modifier/supprimer requirements
- Peut gérer tous les utilisateurs et classes

##   API Endpoints

### Authentication (`/api/auth`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| POST | `/register` | Inscription | Public |
| POST | `/login` | Connexion | Public |
| GET | `/me` | Profil utilisateur | Privé |
| PUT | `/profile` | Modifier profil | Privé |

### Users (`/api/users`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | `/` | Liste utilisateurs | Admin |
| GET | `/:id` | Détails utilisateur | Owner/Admin |
| PUT | `/:id` | Modifier utilisateur | Admin |
| DELETE | `/:id` | Supprimer utilisateur | Admin |

### Classes (`/api/classes`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | `/` | Liste classes | Tous |
| GET | `/:id` | Détails classe | Membres/Tuteur/Admin |
| POST | `/` | Créer classe | Tuteur/Admin |
| PUT | `/:id` | Modifier classe | Tuteur/Admin |
| DELETE | `/:id` | Supprimer classe | Admin |
| GET | `/:id/members` | Membres classe | Membres/Tuteur/Admin |
| POST | `/:id/members` | Ajouter membre | Tuteur/Admin |
| DELETE | `/:id/members/:userId` | Retirer membre | Tuteur/Admin |

### Requirements (`/api/requirements`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | `/` | Liste requirements | Tous |
| GET | `/:id` | Détails requirement | Tous |
| POST | `/` | Créer requirement | Admin |
| PUT | `/:id` | Modifier requirement | Admin |
| POST | `/:id/validate` | Valider/Refuser | Tuteur/Admin |
| DELETE | `/:id` | Supprimer requirement | Admin |
| GET | `/stats/:classId` | Statistiques | Tuteur/Admin |

## 🔒 Authentification

Toutes les routes protégées nécessitent un token JWT dans le header :

```
Authorization: Bearer <votre_token_jwt>
```

### Exemple de requête

```javascript
const response = await fetch('http://localhost:5001/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🧪 Données de Test

Si vous avez exécuté `npm run db:seed`, vous avez accès à ces utilisateurs de test :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@equilibre.com | password123 | ADMIN |
| tuteur1@equilibre.com | password123 | TUTEUR_ECOLE |
| alternant1@student.com | password123 | ALTERNANT |
| etudiant1@student.com | password123 | ETUDIANT_CLASSIQUE |
| maitre1@entreprise.com | password123 | MAITRE_APP |

## 📁 Structure du Projet

```
Backend/
├── src/
│   ├── config/          # Configuration (DB, constantes)
│   │   ├── database.js
│   │   └── constants.js
│   ├── controllers/     # Logique métier
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── classController.js
│   │   └── requirementController.js
│   ├── middlewares/     # Middlewares (auth, rôles)
│   │   ├── auth.js
│   │   └── roleCheck.js
│   ├── models/          # Modèles de données
│   │   ├── User.js
│   │   ├── Class.js
│   │   └── Requirement.js
│   ├── routes/          # Routes API
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── classRoutes.js
│   │   └── requirementRoutes.js
│   ├── database/        # Scripts SQL
│   │   ├── schema.sql   # Schéma de la base
│   │   └── seed.sql     # Données de test
│   ├── utils/           # Utilitaires
│   │   └── dbInit.js    # Script d'initialisation
│   └── server.js        # Point d'entrée
├── .env                 # Variables d'environnement
├── .env.example         # Exemple de configuration
├── package.json
└── README.md
```

## 🛡️ Sécurité

-   Mots de passe hashés avec bcrypt
-   Tokens JWT avec expiration
-   Protection CORS
-   Validation des entrées
-   Permissions basées sur les rôles
-   Protection contre les injections SQL (requêtes paramétrées)

##   Scripts npm

```bash
npm start          # Démarrer le serveur en production
npm run dev        # Démarrer en mode développement (avec nodemon)
npm run db:init    # Initialiser la base de données (sans données)
npm run db:seed    # Initialiser avec données de test
```

## 🐛 Débogage

Pour activer les logs détaillés, modifier dans `.env` :

```env
NODE_ENV=development
```

##   Monitoring

Health check endpoint disponible :

```bash
curl http://localhost:5001/health
```

## 🤝 Contribution

1. Créer une branche pour votre fonctionnalité
2. Commiter vos changements
3. Pousser la branche
4. Créer une Pull Request

## 📝 License

ISC

## 👥 Équipe

EquiLibre Team

---

**Besoin d'aide ?** Consultez la documentation ou contactez l'équipe de développement.
