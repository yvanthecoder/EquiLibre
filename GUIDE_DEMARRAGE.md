#   GUIDE DE DÉMARRAGE COMPLET - EQUILIBRE

Guide complet pour lancer la plateforme EquiLibre avec le frontend, backend et base de données actifs.

---

##   Table des matières

1. [Prérequis](#prérequis)
2. [Architecture du système](#architecture-du-système)
3. [Installation initiale](#installation-initiale)
4. [Démarrage complet du système](#démarrage-complet-du-système)
5. [Vérification du fonctionnement](#vérification-du-fonctionnement)
6. [Comptes de test](#comptes-de-test)
7. [Résolution des problèmes](#résolution-des-problèmes)
8. [Arrêt du système](#arrêt-du-système)

---

##   Prérequis

Avant de commencer, assurez-vous d'avoir installé :

-   **Node.js** (v16 ou supérieur) - [Télécharger](https://nodejs.org/)
-   **PostgreSQL** (v12 ou supérieur) - [Télécharger](https://www.postgresql.org/download/)
-   **npm** (installé avec Node.js)

### Vérifier les installations

```bash
# Vérifier Node.js
node --version
# Devrait afficher : v16.x.x ou supérieur

# Vérifier npm
npm --version
# Devrait afficher : 8.x.x ou supérieur

# Vérifier PostgreSQL
psql --version
# Devrait afficher : psql (PostgreSQL) 12.x ou supérieur

# Vérifier que PostgreSQL fonctionne
pg_isready
# Devrait afficher : /tmp:5432 - accepting connections
```

---

##   Architecture du système

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              PLATEFORME EQUILIBRE                   │
│                                                     │
├─────────────────┬──────────────────┬────────────────┤
│                 │                  │                │
│   FRONTEND      │    BACKEND       │   DATABASE     │
│   (React+Vite)  │    (Express)     │  (PostgreSQL)  │
│                 │                  │                │
│   Port: 5173    │    Port: 5001    │   Port: 5432   │
│                 │                  │                │
└─────────────────┴──────────────────┴────────────────┘
```

**Composants :**

1. **Frontend** : Interface utilisateur React (à développer)
2. **Backend** : API REST Node.js/Express avec authentification JWT
3. **Database** : Base de données PostgreSQL avec 5 rôles utilisateurs

---

##   Installation initiale

### Étape 1 : Cloner ou accéder au projet

```bash
cd "/Users/yvandjopa/Documents/Projet SIGL/EquiLibre"
```

### Étape 2 : Installer les dépendances Backend

```bash
cd Backend
npm install
```

### Étape 3 : Configurer les variables d'environnement

Le fichier `.env` est déjà configuré. Vérifiez qu'il contient :

```bash
cat Backend/.env
```

Devrait afficher :
```env
PORT=5001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=equilibre_db
DB_USER=yvandjopa
DB_PASSWORD=
JWT_SECRET=equilibre_secret_key_2024_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Étape 4 : Initialiser la base de données

```bash
cd Backend
npm run db:seed
```

  Cela va :
- Créer la base de données `equilibre_db`
- Créer toutes les tables nécessaires
- Insérer des données de test (9 utilisateurs de test)

Vous devriez voir :
```
  Base de données equilibre_db créée avec succès
  Schéma exécuté avec succès
  Données de test insérées avec succès
  Initialisation terminée avec succès!
```

---

## 🎬 Démarrage complet du système

###   ÉTAPE 1 : Démarrer PostgreSQL

PostgreSQL devrait déjà être actif. Vérifiez :

```bash
pg_isready
```

Si PostgreSQL n'est pas actif :

```bash
# Sur macOS (Homebrew)
brew services start postgresql

# Sur Linux
sudo systemctl start postgresql

# Sur Windows
# Démarrer via le "Services" ou pg_ctl
```

---

###   ÉTAPE 2 : Démarrer le Backend

**Option A : Mode production**

```bash
cd Backend
npm start
```

**Option B : Mode développement (avec auto-reload)**

```bash
cd Backend
npm run dev
```

  Le backend démarre sur **http://localhost:5001**

Vous devriez voir :
```
╔═══════════════════════════════════════╗
║     SERVEUR EQUILIBRE DÉMARRÉ       ║
╚═══════════════════════════════════════╝
  Port: 5001
  Environnement: development
  URL: http://localhost:5001
  Documentation: http://localhost:5001/api/docs
═════════════════════════════════════════
```

**  IMPORTANT :** Gardez ce terminal ouvert !

---

###   ÉTAPE 3 : Démarrer le Frontend

```bash
# Dans un NOUVEAU terminal
cd Frontend
npm install    # Si pas encore fait
npm run dev
```

Le frontend démarrera sur **http://localhost:5173**

**  IMPORTANT :** Utilisez `npm run dev` (pas `npm start`)

---

##   Vérification du fonctionnement

### 1. Tester le Backend

Ouvrez un nouveau terminal et testez :

```bash
# Test de santé
curl http://localhost:5001/health

# Devrait afficher :
# {"success":true,"status":"healthy","database":"connected","timestamp":"..."}
```

### 2. Tester l'authentification

```bash
# Se connecter avec l'admin
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@equilibre.com","password":"password123"}'
```

Vous devriez recevoir un token JWT et les informations de l'utilisateur.

### 3. Tester un endpoint protégé

```bash
# Récupérer le token du login précédent et l'utiliser
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 👥 Comptes de test

Tous les comptes utilisent le mot de passe : **password123**

###   Administrateur
- **Email :** admin@equilibre.com
- **Rôle :** ADMIN
- **Permissions :** Accès complet (créer/modifier/supprimer requirements, gérer utilisateurs et classes)

###   Tuteurs d'école
- **Email :** tuteur1@equilibre.com
- **Rôle :** TUTEUR_ECOLE
- **Permissions :** Valider/refuser requirements, gérer leurs classes

- **Email :** tuteur2@equilibre.com
- **Rôle :** TUTEUR_ECOLE

###   Maîtres d'apprentissage
- **Email :** maitre1@entreprise.com
- **Rôle :** MAITRE_APP
- **Entreprise :** Tech Corp
- **Permissions :** Voir les données de leurs apprentis

- **Email :** maitre2@entreprise.com
- **Rôle :** MAITRE_APP
- **Entreprise :** Innovation SA

###   Alternants
- **Email :** alternant1@student.com
- **Rôle :** ALTERNANT
- **Entreprise :** Tech Corp
- **Permissions :** Voir ses requirements et classes

- **Email :** alternant2@student.com
- **Rôle :** ALTERNANT
- **Entreprise :** Innovation SA

###   Étudiants classiques
- **Email :** etudiant1@student.com
- **Rôle :** ETUDIANT_CLASSIQUE
- **Permissions :** Voir ses requirements et classes

- **Email :** etudiant2@student.com
- **Rôle :** ETUDIANT_CLASSIQUE

---

## 🛠️ Résolution des problèmes

### Problème : PostgreSQL ne démarre pas

```bash
# Vérifier le statut
pg_isready

# Redémarrer PostgreSQL (macOS)
brew services restart postgresql

# Voir les logs
tail -f /usr/local/var/log/postgres.log
```

### Problème : Port 5001 déjà utilisé

```bash
# Trouver le processus
lsof -ti:5001

# Tuer le processus
lsof -ti:5001 | xargs kill -9

# Ou changer le port dans Backend/.env
PORT=5002
```

### Problème : Erreur de connexion à la DB

Vérifiez dans `Backend/.env` que :
- `DB_USER` correspond à votre utilisateur PostgreSQL
- `DB_PASSWORD` est correct (peut être vide)

Pour trouver votre utilisateur PostgreSQL :
```bash
whoami
# Utilisez cette valeur pour DB_USER
```

### Problème : "Cannot find module"

```bash
cd Backend
rm -rf node_modules package-lock.json
npm install
```

### Problème : Token JWT invalide

Les tokens expirent après 7 jours. Reconnectez-vous pour obtenir un nouveau token.

---

##   Arrêt du système

### 1. Arrêter le Backend

Dans le terminal du backend : **Ctrl + C**

### 2. Arrêter le Frontend

Dans le terminal du frontend : **Ctrl + C**

### 3. Arrêter PostgreSQL (optionnel)

```bash
# macOS
brew services stop postgresql

# Linux
sudo systemctl stop postgresql
```

---

##   Récapitulatif des commandes

### Démarrage rapide (tous les jours)

```bash
# Terminal 1 : Backend
cd "/Users/yvandjopa/Documents/Projet SIGL/EquiLibre/Backend"
npm run dev

# Terminal 2 : Frontend (quand développé)
cd "/Users/yvandjopa/Documents/Projet SIGL/EquiLibre/Frontend"
npm start
# Terminal 3 : Tests
curl http://localhost:5001/health
```

### Réinitialisation complète

```bash
cd "/Users/yvandjopa/Documents/Projet SIGL/EquiLibre/Backend"
npm run db:seed
npm run dev
```

---

##   Documentation API

Une fois le backend démarré, consultez :
- Documentation complète : `Backend/README.md`
- Endpoints disponibles : Voir section "API Endpoints" dans Backend/README.md
- Health check : http://localhost:5001/health

---

##   Étapes suivantes

1.   Backend fonctionnel avec authentification JWT
2.   Base de données PostgreSQL configurée
3.   Développer le Frontend React
4.   Connecter le Frontend au Backend
5.   Implémenter les dashboards par rôle
6.   Ajouter la messagerie
7.   Ajouter les notifications

---

##   Support

Pour toute question ou problème :
1. Consultez le `Backend/README.md`
2. Vérifiez les logs du serveur
3. Testez les endpoints avec curl
4. Vérifiez les variables d'environnement

---

**  VOTRE BACKEND EST MAINTENANT PRÊT À L'EMPLOI !**

Tous les endpoints sont sécurisés avec JWT et les permissions sont gérées par rôle.
