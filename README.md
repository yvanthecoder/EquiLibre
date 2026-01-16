# 🎓 PLATEFORME EQUILIBRE

Système de gestion pédagogique avec 7 rôles utilisateurs : Alternants, Étudiants Classiques, Maîtres d'Apprentissage, Tuteurs d'École, Intervenants, Jurys et Administrateur.

---

## 🚀 DÉMARRAGE RAPIDE

### 1️⃣ Prérequis

- Node.js v18+ (compatible avec les fonctionnalités modernes)
- PostgreSQL v14+
- npm (ou yarn)

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
npm run dev
#   Frontend sur http://localhost:5173
```

---

## 📁 Structure du projet

```
EquiLibre/
├── Backend/              # API Node.js/Express 
│   ├── src/
│   │   ├── config/       # Configuration DB et environnement
│   │   ├── controllers/  # Logique métier
│   │   ├── middlewares/  # Authentification & gestion des rôles
│   │   ├── models/       # Modèles de données
│   │   ├── routes/       # Routes API
│   │   ├── services/     # Services métiers
│   │   ├── utils/        # Fonctions utilitaires
│   │   ├── database/     # Scripts SQL
│   │   └── server.js     # Point d'entrée du serveur
│   └── uploads/          # Fichiers uploadés
│   └── .env              # Variables d'environnement
│   └── README.md         # Documentation API
│
├── Frontend/             # Interface React
│   ├── src/              # Code source React
│   └── README.md         # Documentation Frontend
│
├── GUIDE_DEMARRAGE.md    # 📖 Guide complet de démarrage
├── TESTS_VALIDATION.md   # Rapport de tests
├── EXEMPLES_API.md       # Exemples de requêtes API
└── README.md             # Ce fichier
```

---

## 👥 Les 7 Rôles

| Rôle                  | Description                                   | Permissions principales                          |
|-----------------------|-----------------------------------------------|-------------------------------------------------|
| **ADMIN**             | Administrateur                               | Gestion complète (utilisateurs, classes, etc.)  |
| **TUTEUR_ECOLE**      | Tuteur d'école                               | Valider les requirements, gérer ses classes     |
| **MAITRE_APP**        | Maître d'apprentissage                       | Voir les données de ses apprentis               |
| **ALTERNANT**         | Étudiant en alternance                       | Voir ses requirements et classes                |
| **ETUDIANT_CLASSIQUE**| Étudiant cycle classique                     | Voir ses requirements et classes                |
| **INTERVENANT**       | Intervenant                                  | Assister et noter les soutenances               |
| **JURY**              | Jury                                         | Présider et noter les soutenances               |

---

## 🔐 Comptes de test

**Mot de passe pour tous :** `password123`

| Email                   | Rôle                  |
|-------------------------|-----------------------|
| admin@equilibre.com     | ADMIN                |
| tuteur1@equilibre.com   | TUTEUR_ECOLE         |
| maitre1@entreprise.com  | MAITRE_APP           |
| alternant1@equilibre.com| ALTERNANT            |
| etudiant1@equilibre.com | ETUDIANT_CLASSIQUE   |
| intervenant1@equilibre.com | INTERVENANT       |
| jury1@equilibre.com     | JURY                 |

---

## 📖 Documentation

### Guides complets

- **[GUIDE_DEMARRAGE.md](GUIDE_DEMARRAGE.md)** - Instructions détaillées pour démarrer le projet
- **[TESTS_VALIDATION.md](TESTS_VALIDATION.md)** - Rapport des tests réalisés
- **[EXEMPLES_API.md](EXEMPLES_API.md)** - Exemples de requêtes API
- **[Backend/README.md](Backend/README.md)** - Documentation complète de l'API Backend

### Tests rapides

```bash
# Vérification de l'état du serveur
curl http://localhost:5001/health

# Test de connexion
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@equilibre.com","password":"password123"}'
```

---

## 📊 État du projet

| Composant              | Statut                  |
|-------------------------|-------------------------|
| Backend API            | **TERMINÉ**            |
| Base de données        | **TERMINÉ**            |
| Authentification JWT   | **TERMINÉ**            |
| Gestion des rôles      | **TERMINÉ**            |
| Endpoints API          | **TERMINÉ**            |
| Frontend React         | **EN COURS DE DEVELOPPEMENT** |

---

## 🛠️ Technologies

### Backend
- **Node.js** + **Express**
- **PostgreSQL**
- **JWT** (jsonwebtoken)
- **Bcrypt** pour le hachage des mots de passe
- **CORS** pour la gestion des requêtes cross-origin

### Frontend
- **React**
- **Axios** pour les appels API
- **React Router** pour la navigation
- **Context API** ou **Redux** pour la gestion d'état

---

## 🔮 Prochaines étapes

1. Finaliser les fonctionnalités restantes du Frontend.
2. Ajouter des tests unitaires et d'intégration.
3. Optimiser les performances et la sécurité.

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

**EquiLibre Team - Projet SIGL**
- Yvan
- Nassim
- Adrien
- Ange-Beatriz

---

**✅ BACKEND ET FRONTEND EN COURS DE FINALISATION !**
