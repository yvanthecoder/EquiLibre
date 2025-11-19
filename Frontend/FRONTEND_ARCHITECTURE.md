# Frontend Architecture - Plateforme Étudiants EquiLibre

##   Architecture Technique

### Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management & Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios avec intercepteurs
- **Styling**: TailwindCSS
- **Forms**: React Hook Form + Yup validation
- **Notifications**: React Hot Toast
- **Icons**: Heroicons
- **Date Management**: date-fns

## 📂 Structure du Projet

```
Frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Layout/          # Layout principal (Header, Sidebar, etc.)
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── UI/              # Composants UI génériques
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── FileUpload.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── hooks/               # Hooks React Query personnalisés
│   │   ├── useAuth.ts       # Authentication
│   │   ├── useRequirements.ts
│   │   ├── useEvents.ts
│   │   ├── useMessages.ts
│   │   ├── useNotifications.ts
│   │   ├── useFiles.ts
│   │   ├── useUsers.ts
│   │   └── useClass.ts
│   │
│   ├── pages/               # Pages de l'application
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Requirements.tsx
│   │   ├── RequirementDetail.tsx
│   │   ├── Profile.tsx
│   │   ├── Class.tsx
│   │   ├── Files.tsx
│   │   ├── Calendar.tsx
│   │   ├── Messages.tsx
│   │   ├── MessageThread.tsx
│   │   └── admin/           # Pages d'administration
│   │       ├── AdminRequirements.tsx
│   │       ├── AdminCalendar.tsx
│   │       └── AdminUsers.tsx
│   │
│   ├── services/            # Services API
│   │   └── api.service.ts   # Tous les endpoints API
│   │
│   ├── lib/                 # Utilitaires et configuration
│   │   └── api.ts           # Configuration Axios avec intercepteurs
│   │
│   ├── types/               # Types TypeScript
│   │   ├── api.ts           # Types pour les entités API
│   │   └── user.ts          # Types pour l'authentification
│   │
│   ├── App.tsx              # Routing principal
│   ├── main.tsx             # Point d'entrée
│   └── index.css            # Styles globaux
│
├── .env                     # Variables d'environnement
├── .env.example             # Template des variables d'env
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔐 Authentification

### Flux d'authentification
1. **Login/Register** → JWT tokens (access + refresh)
2. **Stockage**: localStorage (`access_token`, `refresh_token`)
3. **Intercepteur Axios**: Injecte automatiquement le token dans chaque requête
4. **Token Refresh**: Renouvellement automatique si 401 avec refresh token
5. **Redirection**: Retour au login si authentification échouée

### Hooks d'authentification
```typescript
const { user, isAuthenticated, login, logout, isLoading } = useAuth();
```

## 🔌 API Integration

### Configuration
- Base URL: `VITE_API_URL` (défini dans `.env`)
- Tous les endpoints sont centralisés dans `services/api.service.ts`

### Services disponibles
- **authService**: login, register, refreshToken, getCurrentUser, logout
- **userService**: getUser, updateUser, deleteUser, getAllUsers
- **classService**: getClass, getClassMembers, getClassRequirements, getClassEvents, createEvent, updateEvent, deleteEvent
- **requirementService**: getRequirement, createRequirement, updateRequirement, deleteRequirement, getSubmissions, submitRequirement, updateSubmissionStatus
- **fileService**: getPersonalFiles, getClassFiles, uploadFile, deleteFile, downloadFile
- **messageService**: getThreads, getThread, getThreadMessages, createThread, sendMessage, markThreadAsRead
- **notificationService**: getNotifications, markAsRead, markAllAsRead, deleteNotification

## 🪝 Hooks React Query

Tous les hooks suivent le même pattern:
- Préfixe `use` suivi du nom de l'entité
- Retournent `{ data, isLoading, error, ...mutations }`
- Gèrent automatiquement le cache et les invalidations

### Exemples

```typescript
// Récupérer les exigences d'une classe
const { requirements, isLoading } = useRequirements(classId);

// Créer une exigence
const { createRequirement, isCreating } = useCreateRequirement();
createRequirement({ title: '...', description: '...', dueDate: '...', classId: '...' });

// Soumettre un document
const { submitRequirement, isSubmitting } = useRequirement(requirementId);
submitRequirement(file);

// Envoyer un message
const { sendMessage, isSending } = useSendMessage();
sendMessage({ threadId: '...', content: '...' });
```

## 🗺️ Routes

### Routes publiques
- `/login` - Connexion
- `/register` - Inscription

### Routes protégées (authentification requise)
- `/dashboard` - Tableau de bord (différent selon rôle)
- `/requirements` - Liste des exigences
- `/requirements/:id` - Détail d'une exigence + soumissions
- `/profile` - Profil utilisateur
- `/class/:id/members` - Membres de la classe
- `/files` - Gestion des fichiers
- `/calendar` - Calendrier des événements
- `/messages` - Liste des conversations
- `/messages/:id` - Détail d'une conversation

### Routes admin (rôles: RESP_PLATEFORME, TUTEUR, MAITRE_APP)
- `/admin/requirements` - Gestion des exigences
- `/admin/calendar` - Gestion du calendrier
- `/admin/users` - Gestion des utilisateurs (RESP_PLATEFORME uniquement)

## 🎨 Composants UI

### Button
```typescript
<Button
  variant="primary|secondary|success|danger|outline"
  size="sm|md|lg"
  isLoading={boolean}
>
  Texte
</Button>
```

### Card
```typescript
<Card className="custom-class">
  Contenu
</Card>
```

### Modal
```typescript
<Modal
  isOpen={boolean}
  onClose={() => {}}
  title="Titre"
  size="sm|md|lg|xl"
>
  Contenu
</Modal>
```

### Table
```typescript
<Table
  data={data}
  columns={[
    { header: 'Nom', accessor: 'name' },
    { header: 'Actions', accessor: (row) => <button>Action</button> }
  ]}
  emptyMessage="Aucune donnée"
/>
```

### FileUpload
```typescript
<FileUpload
  onFileSelect={(file) => {}}
  accept=".pdf,.doc,.docx"
  maxSize={10}
  label="Sélectionner un fichier"
/>
```

### StatusBadge
```typescript
<StatusBadge
  status="PENDING|SUBMITTED|VALIDATED|REJECTED|LOCKED"
  size="sm|md"
/>
```

## 🔔 Notifications

Les notifications sont gérées avec React Hot Toast et automatiquement intégrées dans tous les hooks.

```typescript
// Dans les hooks, les erreurs et succès déclenchent automatiquement des toasts
toast.success('Opération réussie !');
toast.error('Une erreur est survenue');
```

### Polling pour les notifications temps réel
```typescript
const { notifications, unreadCount } = useNotifications();
// Polling automatique toutes les 30 secondes
```

##   Démarrage

### Installation
```bash
cd Frontend
npm install
```

### Configuration
1. Copier `.env.example` vers `.env`
2. Configurer `VITE_API_URL` avec l'URL du backend

### Développement
```bash
npm run dev
```

### Build Production
```bash
npm run build
npm run preview  # Pour tester le build
```

## 📝 Conventions de Code

### Nommage
- **Composants**: PascalCase (`Dashboard.tsx`)
- **Hooks**: camelCase avec préfixe `use` (`useAuth.ts`)
- **Services**: camelCase avec suffixe `Service` (`authService`)
- **Types**: PascalCase (`User`, `Requirement`)

### Organisation des imports
```typescript
// 1. Imports React
import React, { useState } from 'react';

// 2. Imports de librairies tierces
import { useQuery } from '@tanstack/react-query';

// 3. Imports locaux (composants, hooks, types, services)
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/UI/Button';
```

### Types TypeScript
- Tous les composants doivent être typés
- Utiliser les interfaces pour les props
- Types API centralisés dans `types/api.ts`

##   Gestion des Erreurs

- Erreurs API gérées dans les hooks avec React Query
- Erreurs d'authentification → redirection vers `/login`
- Erreurs affichées via toast notifications
- Fallback UI pour les états de chargement et erreurs

## 🧪 Tests

*À venir*: Configuration de tests avec Vitest + React Testing Library

## 📦 Dépendances Principales

```json
{
  "@tanstack/react-query": "^5.90.2",
  "axios": "^1.12.2",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.9.2",
  "react-hook-form": "^7.63.0",
  "@hookform/resolvers": "^5.2.2",
  "yup": "^1.7.1",
  "react-hot-toast": "^2.6.0",
  "date-fns": "^4.1.0",
  "@heroicons/react": "^2.2.0"
}
```

## 🔒 Sécurité

- JWT tokens stockés en localStorage (à migrer vers httpOnly cookies si nécessaire)
- CORS configuré côté backend
- Protection des routes par authentification et rôles
- Validation des formulaires côté client et serveur

## 📱 Responsive Design

- Mobile-first approach avec TailwindCSS
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Navigation adaptative (sidebar → menu hamburger sur mobile)

##   Prochaines Étapes

- [ ] Implémenter WebSocket pour notifications temps réel
- [ ] Ajouter un système de cache plus avancé
- [ ] Implémenter le drag & drop pour les fichiers
- [ ] Ajouter FullCalendar pour la vue calendrier
- [ ] Tests unitaires et e2e
- [ ] Optimisation des performances (lazy loading, code splitting)
- [ ] Migration des tokens vers httpOnly cookies
- [ ] Internationalisation (i18n)

---

**Note**: Ce frontend est entièrement branché aux endpoints API réels. Aucune donnée mockée n'est utilisée.
