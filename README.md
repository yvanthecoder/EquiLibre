# 🎓 PLATEFORME EQUILIBRE

Système de gestion pédagogique avec 5 rôles utilisateurs : Alternants, Étudiants Classiques, Maîtres d'Apprentissage, Tuteurs d'École et Administrateurs.

---

##   DÉMARRAGE RAPIDE

### 1️⃣ Prérequis

- Node.js v16+
- PostgreSQL v12+
- npm

### 2️⃣ Installation

```bash
# Backend
cd Backend
npm install
npm run db:seed

# Frontend (à développer)
cd Frontend
npm install
```

### 3️⃣ Lancement

```bash
# Terminal 1 - Backend
cd Backend
npm run dev
#   Serveur sur http://localhost:5001

# Terminal 2 - Frontend (quand développé)
cd Frontend
npm start
#   Frontend sur http://localhost:3000
```

---

## 📁 Structure du projet

```
EquiLibre/
├── Backend/              # API Node.js/Express   TERMINÉ
│   ├── src/
│   │   ├── config/       # Configuration DB
│   │   ├── controllers/  # Logique métier
│   │   ├── middlewares/  # Auth & rôles
│   │   ├── models/       # Modèles de données
│   │   ├── routes/       # Routes API
│   │   ├── database/     # Scripts SQL
│   │   └── server.js     # Point d'entrée
│   └── README.md         # Documentation API
│
├── Frontend/             # Interface React (à développer)
│   └── README.md
│
├── GUIDE_DEMARRAGE.md    # 📖 Guide complet de démarrage
├── TESTS_VALIDATION.md   #   Rapport de tests
├── EXEMPLES_API.md       #   Exemples de requêtes
└── README.md             # Ce fichier
```

---

## 👥 Les 5 Rôles

| Rôle | Description | Permissions |
|------|-------------|-------------|
|   **ADMIN** | Administrateur | Accès complet, gestion utilisateurs/classes/requirements |
|   **TUTEUR_ECOLE** | Tuteur d'école | Valider requirements, gérer ses classes |
|   **MAITRE_APP** | Maître d'apprentissage | Voir données de ses apprentis |
|   **ALTERNANT** | Étudiant en alternance | Voir ses requirements et classes |
|   **ETUDIANT_CLASSIQUE** | Étudiant cycle classique | Voir ses requirements et classes |

---

## 🔐 Comptes de test

**Mot de passe pour tous :** `password123`

| Email | Rôle |
|-------|------|
| admin@equilibre.com | ADMIN |
| tuteur1@equilibre.com | TUTEUR_ECOLE |
| maitre1@entreprise.com | MAITRE_APP |
| alternant1@student.com | ALTERNANT |
| etudiant1@student.com | ETUDIANT_CLASSIQUE |

---

##   Documentation

### 📖 Guides complets

- **[GUIDE_DEMARRAGE.md](GUIDE_DEMARRAGE.md)** - Comment démarrer le système complet
- **[TESTS_VALIDATION.md](TESTS_VALIDATION.md)** - Preuve du bon fonctionnement
- **[EXEMPLES_API.md](EXEMPLES_API.md)** - Exemples de requêtes curl
- **[Backend/README.md](Backend/README.md)** - Documentation API complète

### 🧪 Tests rapides

```bash
# Health check
curl http://localhost:5001/health

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@equilibre.com","password":"password123"}'
```

---

##   État du projet

| Composant | Statut |
|-----------|--------|
| Backend API |   **TERMINÉ** |
| Base de données |   **TERMINÉ** |
| Authentification JWT |   **TERMINÉ** |
| Gestion des rôles |   **TERMINÉ** |
| Endpoints API |   **TERMINÉ** |
| Frontend React |   À développer |

---

## 🛠️ Technologies

### Backend
- Node.js + Express
- PostgreSQL
- JWT (jsonwebtoken)
- Bcrypt
- CORS

### Frontend (à développer)
- React
- Axios / Fetch
- React Router
- Context API / Redux

---

##   Prochaines étapes

1.   Backend fonctionnel avec authentification
2.   Base de données configurée avec 5 rôles
3.   Développer le Frontend React
4.   Implémenter les dashboards par rôle
5.   Ajouter la messagerie
6.   Ajouter les notifications
7.   Déploiement

---

## 🚨 Support

### Problèmes courants

**Port déjà utilisé :**
```bash
lsof -ti:5001 | xargs kill -9
```

**Base de données :**
```bash
cd Backend
npm run db:seed
```

**Dépendances :**
```bash
cd Backend
rm -rf node_modules package-lock.json
npm install
```

---

## 📄 License

ISC

## 👥 Équipe

EquiLibre Team - Projet SIGL

---

**  BACKEND PRÊT POUR LE DÉVELOPPEMENT FRONTEND !**

Consultez [GUIDE_DEMARRAGE.md](GUIDE_DEMARRAGE.md) pour démarrer.
