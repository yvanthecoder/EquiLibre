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

# Frontend
cd Frontend
npm install
```

### 3️⃣ Lancement

```bash
# Terminal 1 - Backend
cd Backend
npm run dev
#   Serveur sur http://localhost:5001

# Terminal 2 - Frontend
cd Frontend
npm start
npm run dev
#   Frontend sur http://localhost:5173
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
|   **INTERVENANT**  | Intervenant  |  Assister et noter les soutenances  | 
|   **JURY**  | Jury  |  Présider et noter les soutenances  | 

---

## 🔐 Comptes de test

**Mot de passe pour tous :** `password123`

| Email | Rôle |
|-------|------|
| admin@equilibre.com | ADMIN |
| tuteur1@equilibre.com | TUTEUR_ECOLE |
| maitre1@entreprise.com | MAITRE_APP |
| alternant1@equilibre.com | ALTERNANT |
| etudiant1@equilibre.com | ETUDIANT_CLASSIQUE |
| intervenant1@equilibre.com  |  INTERVENANT  |
| jury1@equilibre.com  |  JURY  |
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
| Backend API |   **EN COURS DE DEVELOPPEMENT** |
| Base de données |   **TERMINÉ** |
| Authentification JWT |   **TERMINÉ** |
| Gestion des rôles |   **TERMINÉ** |
| Endpoints API |   **TERMINÉ** |
| Frontend React |   **EN COURS DE DEVELOPPEMENT** |

---

## 🛠️ Technologies

### Backend
- Node.js + Express
- PostgreSQL
- JWT (jsonwebtoken)
- Bcrypt
- CORS

### Frontend
- React
- Axios / Fetch
- React Router
- Context API / Redux

---

##   Prochaines étapes

1.   Réalisation des US restantes

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
- Yvan
- Nassim
- Adrien
- Ange-Beatriz

---

**  BACKEND ET FRONTEND FONCTIONNEL !**

