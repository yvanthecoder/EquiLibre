#   EXEMPLES D'UTILISATION DE L'API EQUILIBRE

Collection de requêtes curl pour tester et utiliser l'API.

---

## 📝 Configuration

Assurez-vous que le backend tourne sur **http://localhost:5001**

```bash
cd Backend
npm run dev
```

---

## 1️⃣ ENDPOINTS PUBLICS

### Health Check

```bash
curl http://localhost:5001/health | jq
```

### Informations API

```bash
curl http://localhost:5001/ | jq
```

---

## 2️⃣ AUTHENTIFICATION

### Inscription d'un nouvel utilisateur

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau@test.com",
    "password": "password123",
    "firstname": "Nouveau",
    "lastname": "Utilisateur",
    "role": "ETUDIANT_CLASSIQUE"
  }' | jq
```

### Connexion - Admin

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@equilibre.com",
    "password": "password123"
  }' | jq
```

**Sauvegardez le token retourné !**

### Connexion - Tuteur

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tuteur1@equilibre.com",
    "password": "password123"
  }' | jq
```

### Connexion - Alternant

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alternant1@student.com",
    "password": "password123"
  }' | jq
```

### Connexion - Étudiant Classique

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "etudiant1@student.com",
    "password": "password123"
  }' | jq
```

### Connexion - Maître d'apprentissage

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maitre1@entreprise.com",
    "password": "password123"
  }' | jq
```

---

## 3️⃣ PROFIL UTILISATEUR

**Note :** Remplacez `YOUR_TOKEN` par le token JWT obtenu lors du login

### Obtenir son profil

```bash
TOKEN="YOUR_TOKEN"

curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Modifier son profil

```bash
TOKEN="YOUR_TOKEN"

curl -X PUT http://localhost:5001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Prénom",
    "lastname": "Nom",
    "phone": "0612345678"
  }' | jq
```

---

## 4️⃣ GESTION DES UTILISATEURS (Admin uniquement)

### Lister tous les utilisateurs

```bash
TOKEN="YOUR_ADMIN_TOKEN"

curl http://localhost:5001/api/users \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Filtrer par rôle

```bash
TOKEN="YOUR_ADMIN_TOKEN"

curl "http://localhost:5001/api/users?role=ALTERNANT" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Obtenir un utilisateur par ID

```bash
TOKEN="YOUR_ADMIN_TOKEN"

curl http://localhost:5001/api/users/1 \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Modifier un utilisateur

```bash
TOKEN="YOUR_ADMIN_TOKEN"

curl -X PUT http://localhost:5001/api/users/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Marie",
    "lastname": "Dupont-Martin"
  }' | jq
```

### Supprimer (désactiver) un utilisateur

```bash
TOKEN="YOUR_ADMIN_TOKEN"

curl -X DELETE http://localhost:5001/api/users/10 \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 5️⃣ GESTION DES CLASSES

### Lister toutes les classes

```bash
TOKEN="YOUR_TOKEN"

curl http://localhost:5001/api/classes \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Obtenir une classe par ID

```bash
TOKEN="YOUR_TOKEN"

curl http://localhost:5001/api/classes/1 \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Créer une classe (Admin ou Tuteur)

```bash
TOKEN="YOUR_ADMIN_OR_TUTEUR_TOKEN"

curl -X POST http://localhost:5001/api/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Master 1 SIGL - Groupe C",
    "description": "Nouvelle promotion",
    "year": "2024-2025",
    "level": "M1",
    "tuteurId": 2
  }' | jq
```

### Modifier une classe

```bash
TOKEN="YOUR_ADMIN_OR_TUTEUR_TOKEN"

curl -X PUT http://localhost:5001/api/classes/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Description mise à jour"
  }' | jq
```

### Supprimer une classe (Admin)

```bash
TOKEN="YOUR_ADMIN_TOKEN"

curl -X DELETE http://localhost:5001/api/classes/3 \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 6️⃣ GESTION DES MEMBRES DE CLASSE

### Obtenir les membres d'une classe

```bash
TOKEN="YOUR_TOKEN"

curl http://localhost:5001/api/classes/1/members \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Ajouter un membre à une classe (Admin ou Tuteur)

```bash
TOKEN="YOUR_ADMIN_OR_TUTEUR_TOKEN"

curl -X POST http://localhost:5001/api/classes/1/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 8
  }' | jq
```

### Retirer un membre d'une classe (Admin ou Tuteur)

```bash
TOKEN="YOUR_ADMIN_OR_TUTEUR_TOKEN"

curl -X DELETE http://localhost:5001/api/classes/1/members/8 \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 7️⃣ GESTION DES REQUIREMENTS

### Lister tous les requirements

```bash
TOKEN="YOUR_TOKEN"

curl http://localhost:5001/api/requirements \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Filtrer par classe

```bash
TOKEN="YOUR_TOKEN"

curl "http://localhost:5001/api/requirements?classId=1" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Obtenir un requirement par ID

```bash
TOKEN="YOUR_TOKEN"

curl http://localhost:5001/api/requirements/1 \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Créer un requirement (Admin uniquement)

```bash
TOKEN="YOUR_ADMIN_TOKEN"

curl -X POST http://localhost:5001/api/requirements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Rapport mensuel",
    "description": "Soumettre le rapport mensuel de stage",
    "classId": 1,
    "deadline": "2025-12-31T23:59:59Z"
  }' | jq
```

### Modifier un requirement (Admin)

```bash
TOKEN="YOUR_ADMIN_TOKEN"

curl -X PUT http://localhost:5001/api/requirements/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Rapport de stage - Trimestre 1 (MISE À JOUR)",
    "deadline": "2025-01-15T23:59:59Z"
  }' | jq
```

### Valider un requirement (Tuteur ou Admin)

```bash
TOKEN="YOUR_TUTEUR_OR_ADMIN_TOKEN"

curl -X POST http://localhost:5001/api/requirements/1/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "comment": "Excellent travail !"
  }' | jq
```

### Refuser un requirement (Tuteur ou Admin)

```bash
TOKEN="YOUR_TUTEUR_OR_ADMIN_TOKEN"

curl -X POST http://localhost:5001/api/requirements/2/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REJECTED",
    "comment": "Document incomplet, merci de revoir les sections 2 et 3"
  }' | jq
```

### Supprimer un requirement (Admin)

```bash
TOKEN="YOUR_ADMIN_TOKEN"

curl -X DELETE http://localhost:5001/api/requirements/5 \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Statistiques des requirements d'une classe

```bash
TOKEN="YOUR_TUTEUR_OR_ADMIN_TOKEN"

curl http://localhost:5001/api/requirements/stats/1 \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 8️⃣ SCÉNARIOS COMPLETS

### Scénario 1 : Connexion et consultation du profil

```bash
# 1. Se connecter
RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alternant1@student.com","password":"password123"}')

# 2. Extraire le token
TOKEN=$(echo $RESPONSE | jq -r '.data.token')

# 3. Voir son profil
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Scénario 2 : Admin crée une classe et ajoute des membres

```bash
# 1. Login admin
RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@equilibre.com","password":"password123"}')

TOKEN=$(echo $RESPONSE | jq -r '.data.token')

# 2. Créer une classe
CLASS_RESPONSE=$(curl -s -X POST http://localhost:5001/api/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Class",
    "year": "2024-2025",
    "level": "M1",
    "tuteurId": 2
  }')

CLASS_ID=$(echo $CLASS_RESPONSE | jq -r '.data.id')

# 3. Ajouter un membre
curl -X POST http://localhost:5001/api/classes/$CLASS_ID/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": 6}' | jq
```

### Scénario 3 : Tuteur valide des requirements

```bash
# 1. Login tuteur
RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tuteur1@equilibre.com","password":"password123"}')

TOKEN=$(echo $RESPONSE | jq -r '.data.token')

# 2. Voir les requirements
curl http://localhost:5001/api/requirements \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Valider un requirement
curl -X POST http://localhost:5001/api/requirements/1/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "comment": "Travail satisfaisant"
  }' | jq
```

---

## 9️⃣ TESTS D'ERREUR

### Token invalide

```bash
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer invalid_token" | jq
```

### Sans token

```bash
curl http://localhost:5001/api/users | jq
```

### Mauvais mot de passe

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@equilibre.com",
    "password": "wrongpassword"
  }' | jq
```

### Email inexistant

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@test.com",
    "password": "password123"
  }' | jq
```

---

## 🔟 COMMANDES UTILES

### Pretty print avec jq

```bash
# Installer jq (si pas installé)
brew install jq  # macOS
sudo apt-get install jq  # Ubuntu

# Utiliser avec curl
curl http://localhost:5001/health | jq
```

### Sauvegarder le token dans une variable

```bash
# Bash
export TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@equilibre.com","password":"password123"}' \
  | jq -r '.data.token')

# Utiliser le token
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Voir les headers de réponse

```bash
curl -i http://localhost:5001/health
```

### Timing de la requête

```bash
curl -w "\nTotal time: %{time_total}s\n" \
  http://localhost:5001/health
```

---

##   Documentation complète

Pour plus d'informations, consultez :
- **Backend/README.md** - Documentation complète de l'API
- **GUIDE_DEMARRAGE.md** - Guide de démarrage
- **TESTS_VALIDATION.md** - Rapport de tests

---

**  PRÊT À TESTER !**

Tous ces exemples sont fonctionnels avec votre backend EquiLibre.
