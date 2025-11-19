# Corrections Systeme d'Inscription - EquiLibre

## Probleme Identifie

Lors de l'inscription avec le formulaire Register.tsx, des erreurs se produisaient car les champs `jobTitle` et `classId` n'etaient pas transmis correctement au backend.

## Causes du Probleme

### 1. Type TypeScript incomplet
Le type `RegisterRequest` dans `/Frontend/src/types/api.ts` ne contenait pas les champs `jobTitle` et `classId`.

**Avant:**
```typescript
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  company?: string;
  phone?: string;
}
```

### 2. Service API incomplet
La fonction `authService.register` dans `/Frontend/src/services/api.service.ts` n'envoyait pas ces champs au backend.

**Avant:**
```typescript
const backendData = {
  email: userData.email,
  password: userData.password,
  firstname: userData.firstName,
  lastname: userData.lastName,
  role: userData.role,
  company: userData.company,
  phone: userData.phone,
};
```

## Corrections Apportees

### 1. Mise a jour du type RegisterRequest
**Fichier:** `/Frontend/src/types/api.ts`

**Apres:**
```typescript
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  company?: string;
  phone?: string;
  jobTitle?: string;    // AJOUTE
  classId?: string;     // AJOUTE
}
```

### 2. Mise a jour du service API
**Fichier:** `/Frontend/src/services/api.service.ts`

**Apres:**
```typescript
register: async (userData: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> => {
  const backendData: any = {
    email: userData.email,
    password: userData.password,
    firstname: userData.firstName,
    lastname: userData.lastName,
    role: userData.role,
    company: userData.company,
    phone: userData.phone,
  };

  // Add jobTitle and classId if they exist
  if (userData.jobTitle) {
    backendData.jobTitle = userData.jobTitle;
  }
  if (userData.classId) {
    backendData.classId = userData.classId;
  }

  console.log('Sending registration data:', backendData);

  const response = await api.post('/auth/register', backendData);
  const { token, user: backendUser } = response.data.data;
  return {
    user: {
      id: backendUser.id.toString(),
      email: backendUser.email,
      firstName: backendUser.firstname,
      lastName: backendUser.lastname,
      role: backendUser.role,
      avatar: backendUser.profile_picture,
      createdAt: backendUser.created_at,
    },
    tokens: {
      access_token: token,
      refresh_token: token,
    },
  };
},
```

## Validation des Roles

Le backend valide les champs requis selon le role:

### ALTERNANT
**Champs requis:**
- email, password, firstname, lastname, role
- company (entreprise)
- jobTitle (poste occupe)
- classId (classe)

### MAITRE_APP
**Champs requis:**
- email, password, firstname, lastname, role
- company (entreprise)
- jobTitle (poste occupe)

### ETUDIANT_CLASSIQUE
**Champs requis:**
- email, password, firstname, lastname, role
- classId (classe)

### TUTEUR_ECOLE
**Champs requis:**
- email, password, firstname, lastname, role

### ADMIN
**Champs requis:**
- email, password, firstname, lastname, role

## Test de l'Inscription

Pour tester que l'inscription fonctionne correctement:

### 1. Via l'Interface Frontend

1. Ouvrir http://localhost:5173
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire en selectionnant un role
4. Les champs conditionnels apparaitront selon le role:
   - ALTERNANT: Entreprise, Poste, Classe
   - MAITRE_APP: Entreprise, Poste
   - ETUDIANT_CLASSIQUE: Classe
   - TUTEUR_ECOLE: Aucun champ supplementaire
   - ADMIN: Aucun champ supplementaire
5. Cliquer sur "Creer le compte"
6. L'utilisateur devrait etre cree et automatiquement connecte

### 2. Via curl (Test Backend Direct)

#### Test ALTERNANT
```bash
curl -X POST "http://localhost:5001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.alternant@example.com",
    "password": "Test123456!",
    "firstname": "Test",
    "lastname": "Alternant",
    "role": "ALTERNANT",
    "company": "Entreprise Test",
    "jobTitle": "Developpeur Junior",
    "classId": "1",
    "phone": "+33612345678"
  }'
```

#### Test MAITRE_APP
```bash
curl -X POST "http://localhost:5001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.maitre@example.com",
    "password": "Test123456!",
    "firstname": "Test",
    "lastname": "Maitre",
    "role": "MAITRE_APP",
    "company": "Entreprise Test",
    "jobTitle": "Chef de Projet",
    "phone": "+33612345678"
  }'
```

#### Test ETUDIANT_CLASSIQUE
```bash
curl -X POST "http://localhost:5001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.etudiant@example.com",
    "password": "Test123456!",
    "firstname": "Test",
    "lastname": "Etudiant",
    "role": "ETUDIANT_CLASSIQUE",
    "classId": "1",
    "phone": "+33612345678"
  }'
```

## Verification dans la Base de Donnees

Apres inscription, verifier que l'utilisateur a bien ete cree:

```bash
psql -U yvandjopa -d equilibre_db -c "SELECT id, email, firstname, lastname, role, company, job_title, class_id FROM users ORDER BY created_at DESC LIMIT 1;"
```

## Debugging

Si des erreurs persistent:

### 1. Verifier les logs du navigateur
Ouvrir la console (F12) et chercher le message:
```
Sending registration data: { email: ..., firstname: ..., jobTitle: ..., classId: ... }
```

### 2. Verifier les logs du backend
Le backend affichera:
```
POST /api/auth/register
```

### 3. Verifier les classes disponibles
```bash
curl -X GET "http://localhost:5001/api/classes/available"
```

## Status des Corrections

- [x] Type RegisterRequest mis a jour
- [x] Service API mis a jour
- [x] Backend valide correctement les champs
- [x] Formulaire frontend capture tous les champs
- [x] Serveur backend fonctionne (port 5001)
- [x] Base de donnees connectee

## Prochaines Etapes

1. Tester l'inscription avec chaque type de role
2. Verifier que la connexion automatique apres inscription fonctionne
3. Verifier que les donnees sont correctement enregistrees dans la DB
4. Si necessaire, tester le systeme de messagerie avec les nouveaux utilisateurs

## Notes Importantes

- Les mots de passe doivent contenir au moins 8 caracteres
- L'email doit etre unique dans la base de donnees
- Les tokens JWT expirent apres 7 jours
- Le frontend stocke le token dans localStorage sous la cle 'access_token'
