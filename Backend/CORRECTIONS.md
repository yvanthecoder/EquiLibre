# Corrections apportées au Backend EquiLibre

## Problèmes identifiés et résolus

### 1. Problème de connexion à PostgreSQL ❌ ✅

**Problème :**
- Le fichier `.env` contenait les identifiants de l'ancien développeur (`adriennd`)
- Les variables d'environnement étaient en cache dans le shell

**Solution :**
- Mise à jour du fichier `.env` avec l'utilisateur PostgreSQL local (`yvandjopa`)
- Création d'un script `start.sh` qui nettoie les variables d'environnement avant de démarrer
- Suppression du mot de passe car l'authentification locale PostgreSQL sur macOS ne le nécessite pas

**Fichiers modifiés :**
- `.env` : Mise à jour des credentials DB
- `start.sh` : Script de démarrage avec nettoyage des variables

### 2. Absence des classes requises ❌ ✅

**Problème :**
- Le fichier `seed.sql` ne contenait que 2 classes (Master 1 et Master 2)
- Les 8 classes requises n'étaient pas disponibles : Prepa 1, Prepa 2, E3E, E4E, E5E, E3A, E4A, E5A

**Solution :**
- Remplacement des 2 anciennes classes par les 8 nouvelles classes
- Mise à jour des associations utilisateurs-classes
- Mise à jour des requirements et événements pour pointer vers les nouvelles classes

**Fichiers modifiés :**
- `src/database/seed.sql` : Ajout des 8 nouvelles classes

### 3. Problème de sélection de classe lors de l'inscription ❌ ✅

**Problème :**
- Les alternants et étudiants ne voyaient pas les classes disponibles lors de l'inscription

**Solution :**
- L'API `/api/classes/available` est publique et fonctionne correctement
- Les 8 classes sont maintenant disponibles pour la sélection
- L'inscription avec `classId` fonctionne et associe correctement l'utilisateur à sa classe

### 4. Identifiants de connexion non documentés ❌ ✅

**Problème :**
- Pas de documentation claire des identifiants de test
- Mot de passe inconnu pour les utilisateurs de test

**Solution :**
- Création du fichier `EXEMPLES_API.md` avec tous les identifiants
- Tous les utilisateurs de test utilisent maintenant `password123`
- Documentation complète des endpoints API avec exemples

## Classes disponibles

Les 8 classes suivantes sont maintenant disponibles :

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

## Identifiants de test

Tous les utilisateurs utilisent le mot de passe : **`password123`**

### Par rôle :
- **Admin** : `admin@equilibre.com`
- **Tuteurs** : `tuteur1@equilibre.com`, `tuteur2@equilibre.com`
- **Maîtres d'apprentissage** : `maitre1@entreprise.com`, `maitre2@entreprise.com`
- **Alternants** : `alternant1@student.com` (classe E3A), `alternant2@student.com` (classe E4A)
- **Étudiants** : `etudiant1@student.com` (classe E3E), `etudiant2@student.com` (classe E4E)

## Scripts utiles

### Démarrer le serveur
```bash
./start.sh
```
Ce script nettoie les variables d'environnement et démarre le serveur en mode développement.

### Réinitialiser la base de données
```bash
./reset-db.sh
```
Ce script réinitialise complètement la base de données avec les données de test.

### Commandes manuelles
```bash
# Démarrer le serveur (mode dev)
npm run dev

# Initialiser la base de données (sans données)
npm run db:init

# Initialiser la base de données (avec données de test)
npm run db:init -- --seed
```

## Tests de vérification

### 1. Tester la connexion
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alternant1@student.com","password":"password123"}'
```

### 2. Vérifier les classes disponibles
```bash
curl http://localhost:5001/api/classes/available
```

### 3. Tester l'inscription avec sélection de classe
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"nouveau@student.com",
    "password":"test123",
    "firstname":"Jean",
    "lastname":"Dupont",
    "role":"ALTERNANT",
    "company":"Test Corp",
    "jobTitle":"Développeur",
    "classId":6
  }'
```

### 4. Health check
```bash
curl http://localhost:5001/health
```

## Structure des fichiers modifiés/créés

```
backend/
├── .env                      # ✏️ Modifié - Credentials PostgreSQL mis à jour
├── src/
│   └── database/
│       └── seed.sql         # ✏️ Modifié - 8 nouvelles classes ajoutées
├── start.sh                 # ✨ Nouveau - Script de démarrage
├── reset-db.sh             # ✨ Nouveau - Script de réinitialisation DB
├── EXEMPLES_API.md         # ✨ Nouveau - Documentation API
└── CORRECTIONS.md          # ✨ Nouveau - Ce fichier
```

## État actuel

✅ Connexion à PostgreSQL fonctionnelle
✅ 8 classes disponibles pour la sélection
✅ API d'inscription fonctionnelle avec sélection de classe
✅ API de connexion fonctionnelle pour tous les rôles
✅ Documentation complète des endpoints et identifiants
✅ Scripts de démarrage et réinitialisation créés

## Pour aller plus loin

### Intégration Frontend
Le frontend doit :
1. Appeler `/api/classes/available` pour récupérer la liste des classes lors de l'inscription
2. Afficher un sélecteur de classe dans le formulaire d'inscription
3. Envoyer le `classId` choisi lors de l'inscription

### Exemple d'intégration React
```javascript
// Récupérer les classes
const [classes, setClasses] = useState([]);

useEffect(() => {
  fetch('http://localhost:5001/api/classes/available')
    .then(res => res.json())
    .then(data => setClasses(data.data || data));
}, []);

// Dans le formulaire
<select name="classId" required>
  <option value="">Sélectionnez une classe</option>
  {classes.map(cls => (
    <option key={cls.id} value={cls.id}>
      {cls.name} - {cls.description}
    </option>
  ))}
</select>
```

## Support

Pour toute question ou problème :
1. Vérifier que le serveur est bien démarré (`./start.sh`)
2. Vérifier la connexion à PostgreSQL (`curl http://localhost:5001/health`)
3. Réinitialiser la base de données si nécessaire (`./reset-db.sh`)
4. Consulter `EXEMPLES_API.md` pour les exemples d'utilisation
