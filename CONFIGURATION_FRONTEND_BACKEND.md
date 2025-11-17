#   CONNEXION FRONTEND ⟷ BACKEND

Guide pour connecter votre frontend React (Vite) au backend Express.

---

##   Configuration actuelle

| Composant | Port | URL | Commande |
|-----------|------|-----|----------|
| **Backend** | 5001 | http://localhost:5001 | `cd Backend && npm start` |
| **Frontend** | 5173 | http://localhost:5173 | `cd Frontend && npm run dev` |
| **Database** | 5432 | localhost | PostgreSQL |

---

##   Configuration déjà faite

### 1. Backend (CORS configuré)  

Le fichier `Backend/.env` est configuré pour accepter les requêtes du frontend :

```env
# Frontend URL (Vite)
FRONTEND_URL=http://localhost:5173
```

Le CORS est déjà configuré dans `Backend/src/server.js` :

```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
```

### 2. Frontend (API configurée)  

Fichiers créés pour vous :

-   `Frontend/.env` - Variables d'environnement
-   `Frontend/src/config/api.ts` - Configuration de l'API
-   `Frontend/src/types/user.ts` - Types TypeScript
-   `Frontend/src/services/authService.ts` - Service d'authentification

---

##   Comment utiliser dans votre code React

### 1. Connexion d'un utilisateur

```tsx
import { login, saveToken } from '../services/authService';

const LoginPage = () => {
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login(email, password);

      // Sauvegarder le token
      saveToken(response.data.token);

      // Sauvegarder l'utilisateur
      localStorage.setItem('user', JSON.stringify(response.data.user));

      console.log('Connecté:', response.data.user);
      // Rediriger vers le dashboard selon le rôle

    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin('admin@equilibre.com', 'password123');
    }}>
      {/* Votre formulaire */}
    </form>
  );
};
```

### 2. Récupérer le profil de l'utilisateur

```tsx
import { getMe, getToken } from '../services/authService';
import { useEffect, useState } from 'react';
import type { User } from '../types/user';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await getMe(token);
          setUser(response.data);
        } catch (error) {
          console.error('Erreur:', error);
        }
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Bonjour {user.firstname} {user.lastname}</h1>
      <p>Rôle: {user.role}</p>
    </div>
  );
};
```

### 3. Faire une requête personnalisée

```tsx
import { API_BASE_URL, getAuthHeaders } from '../config/api';
import { getToken } from '../services/authService';

const fetchClasses = async () => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/api/classes`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des classes');
  }

  return response.json();
};
```

---

## 🛡️ Protéger vos routes React

### Composant ProtectedRoute

Créez `src/components/ProtectedRoute.tsx` :

```tsx
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import type { UserRole } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return <>{children}</>;
};
```

### Utilisation dans App.tsx

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Routes protégées */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Route admin uniquement */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Route tuteur et admin */}
        <Route
          path="/validation"
          element={
            <ProtectedRoute allowedRoles={['TUTEUR_ECOLE', 'ADMIN']}>
              <ValidationPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🎨 Dashboards différents selon le rôle

```tsx
import type { User } from '../types/user';

const Dashboard = () => {
  const userStr = localStorage.getItem('user');
  const user: User | null = userStr ? JSON.parse(userStr) : null;

  if (!user) return <Navigate to="/login" />;

  // Afficher un dashboard différent selon le rôle
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard user={user} />;

    case 'TUTEUR_ECOLE':
      return <TuteurDashboard user={user} />;

    case 'MAITRE_APP':
      return <MaitreDashboard user={user} />;

    case 'ALTERNANT':
      return <AlternantDashboard user={user} />;

    case 'ETUDIANT_CLASSIQUE':
      return <EtudiantDashboard user={user} />;

    default:
      return <div>Rôle inconnu</div>;
  }
};
```

---

## 🧪 Tester la connexion

### Dans le navigateur (Console DevTools)

```javascript
// Test de connexion
fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@equilibre.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Avec curl

```bash
# Test de connexion
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@equilibre.com","password":"password123"}'
```

---

## 🔄 Gérer les erreurs CORS

Si vous voyez cette erreur dans la console :

```
Access to fetch at 'http://localhost:5001/api/...' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**Solution :** Redémarrez le backend pour que le nouveau CORS soit pris en compte :

```bash
# Arrêter le backend (Ctrl + C)
# Redémarrer
cd Backend
npm start
```

---

## 📦 Variables d'environnement Frontend

Le fichier `Frontend/.env` contient :

```env
# URL du backend API
VITE_API_URL=http://localhost:5001

# Autres configurations
VITE_APP_NAME=EquiLibre
VITE_APP_VERSION=1.0.0
```

**Note :** Les variables Vite doivent commencer par `VITE_`

---

##   Démarrage complet

### Terminal 1 - Backend
```bash
cd Backend
npm start
#   Backend sur http://localhost:5001
```

### Terminal 2 - Frontend
```bash
cd Frontend
npm run dev
#   Frontend sur http://localhost:5173
```

### Terminal 3 - Tests
```bash
# Test health check
curl http://localhost:5001/health

# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@equilibre.com","password":"password123"}'
```

---

##   Résumé

**Ce qui est déjà configuré :**
1.   Backend accepte les requêtes depuis http://localhost:5173
2.   Frontend configuré pour appeler http://localhost:5001
3.   Service d'authentification prêt à l'emploi
4.   Types TypeScript pour les 5 rôles
5.   Configuration API centralisée

**Ce qu'il vous reste à faire :**
1.   Créer vos composants React (Dashboard, Login, etc.)
2.   Implémenter les routes React Router
3.   Utiliser les services fournis pour communiquer avec l'API
4.   Gérer l'état global (Context API ou Redux)

---

**  VOTRE FRONTEND ET BACKEND SONT PRÊTS À COMMUNIQUER !**

Utilisez les exemples ci-dessus pour commencer à développer votre interface.
