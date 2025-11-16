import { User, UserRole } from '../types/user';
import { Requirement, Event, Notification, Thread, Message, Class } from '../types/api';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'yvandjopa01@gmail.com',
    firstName: 'yvan',
    lastName: 'Djopa',
    role: 'ETUDIANT',
    classId: 'class-1',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    email: 'beatrizkwongang@gmail.com',
    firstName: 'beatriz',
    lastName: 'Kwongang',
    role: 'ALTERNANT',
    classId: 'class-1',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '3',
    email: 'nassimbourchada@gmail.com',
    firstName: 'nassim',
    lastName: 'Bourchada',
    role: 'TUTEUR',
    classId: 'class-1',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '4',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'Platform',
    role: 'RESP_PLATEFORME',
    createdAt: '2024-01-15T10:00:00Z',
  },
];

// Mock Classes
export const mockClasses: Class[] = [
  {
    id: 'class-1',
    name: 'Développement Web - Promo 2024',
    description: 'Formation développement web full-stack',
    members: mockUsers.filter(u => u.classId === 'class-1'),
    instructors: mockUsers.filter(u => u.role === 'TUTEUR'),
  },
];

// Mock Requirements
export const mockRequirements: Requirement[] = [
  {
    id: 'req-1',
    title: 'Projet React - Application Todo',
    description: 'Développer une application Todo complète avec React, incluant la gestion d\'état, les hooks, et les tests unitaires.',
    dueDate: '2024-02-15T23:59:59Z',
    status: 'PENDING',
    classId: 'class-1',
    createdAt: '2024-01-10T10:00:00Z',
    submissions: [
      {
        id: 'sub-1',
        requirementId: 'req-1',
        userId: '2',
        filePath: '/uploads/marie-todo-app.zip',
        fileName: 'todo-app-marie.zip',
        status: 'SUBMITTED',
        submittedAt: '2024-01-20T14:30:00Z',
      },
    ],
  },
  {
    id: 'req-2',
    title: 'Rapport de stage - Semestre 1',
    description: 'Rédiger un rapport détaillé sur votre expérience de stage du premier semestre, incluant les compétences acquises et les projets réalisés.',
    dueDate: '2024-02-28T23:59:59Z',
    status: 'PENDING',
    classId: 'class-1',
    createdAt: '2024-01-15T10:00:00Z',
    submissions: [],
  },
  {
    id: 'req-3',
    title: 'Présentation Projet Final',
    description: 'Préparer une présentation de 15 minutes sur votre projet final, incluant la démonstration technique et l\'analyse des résultats.',
    dueDate: '2024-03-15T23:59:59Z',
    status: 'VALIDATED',
    classId: 'class-1',
    createdAt: '2024-01-05T10:00:00Z',
    submissions: [
      {
        id: 'sub-2',
        requirementId: 'req-3',
        userId: '1',
        filePath: '/uploads/yvan-presentation.pdf',
        fileName: 'presentation-finale-yvan.pdf',
        status: 'VALIDATED',
        feedback: 'Excellente présentation, très bien structurée et démonstration technique convaincante.',
        submittedAt: '2024-01-25T16:45:00Z',
      },
    ],
  },
  {
    id: 'req-4',
    title: 'Code Review - Projet Collaboratif',
    description: 'Effectuer une revue de code sur le projet d\'un autre étudiant et fournir des commentaires constructifs.',
    dueDate: '2024-01-30T23:59:59Z',
    status: 'LOCKED',
    classId: 'class-1',
    createdAt: '2024-01-01T10:00:00Z',
    submissions: [],
  },
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Cours React Avancé',
    description: 'Hooks personnalisés et optimisation des performances',
    startDate: '2024-02-05T09:00:00Z',
    endDate: '2024-02-05T12:00:00Z',
    classId: 'class-1',
    type: 'COURSE',
  },
  {
    id: 'event-2',
    title: 'Examen JavaScript',
    description: 'Évaluation sur ES6+, async/await, et manipulation DOM',
    startDate: '2024-02-10T14:00:00Z',
    endDate: '2024-02-10T16:00:00Z',
    classId: 'class-1',
    type: 'EXAM',
  },
  {
    id: 'event-3',
    title: 'Deadline Projet React',
    description: 'Date limite de soumission du projet Todo',
    startDate: '2024-02-15T23:59:59Z',
    endDate: '2024-02-15T23:59:59Z',
    classId: 'class-1',
    type: 'DEADLINE',
  },
  {
    id: 'event-4',
    title: 'Réunion Équipe Pédagogique',
    description: 'Point sur l\'avancement des étudiants',
    startDate: '2024-02-08T10:00:00Z',
    endDate: '2024-02-08T11:30:00Z',
    classId: 'class-1',
    type: 'MEETING',
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Nouveau cours disponible',
    message: 'Le cours "React Avancé" a été ajouté à votre planning',
    type: 'INFO',
    read: false,
    createdAt: '2024-01-28T10:00:00Z',
  },
  {
    id: 'notif-2',
    title: 'Rappel échéance',
    message: 'Le projet React est à rendre dans 3 jours',
    type: 'WARNING',
    read: false,
    createdAt: '2024-01-27T15:30:00Z',
  },
  {
    id: 'notif-3',
    title: 'Validation réussie',
    message: 'Votre présentation finale a été validée avec succès',
    type: 'SUCCESS',
    read: true,
    createdAt: '2024-01-26T09:15:00Z',
  },
  {
    id: 'notif-4',
    title: 'Message reçu',
    message: 'Nouveau message de Pierre Bernard dans "Questions Projet"',
    type: 'INFO',
    read: false,
    createdAt: '2024-01-25T14:20:00Z',
  },
];

// Mock Messages and Threads
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    senderId: '3',
    sender: mockUsers[2],
    content: 'Bonjour, avez-vous des questions sur le projet React ?',
    createdAt: '2024-01-25T14:20:00Z',
  },
  {
    id: 'msg-2',
    threadId: 'thread-1',
    senderId: '1',
    sender: mockUsers[0],
    content: 'Oui, j\'ai une question sur l\'utilisation des hooks personnalisés.',
    createdAt: '2024-01-25T14:25:00Z',
  },
  {
    id: 'msg-3',
    threadId: 'thread-2',
    senderId: '2',
    sender: mockUsers[1],
    content: 'Quelqu\'un peut-il m\'aider avec les tests unitaires ?',
    createdAt: '2024-01-24T16:10:00Z',
  },
];

export const mockThreads: Thread[] = [
  {
    id: 'thread-1',
    title: 'Questions Projet React',
    participants: [mockUsers[0], mockUsers[2]],
    lastMessage: mockMessages[1],
    updatedAt: '2024-01-25T14:25:00Z',
  },
  {
    id: 'thread-2',
    title: 'Aide Tests Unitaires',
    participants: [mockUsers[1], mockUsers[2]],
    lastMessage: mockMessages[2],
    updatedAt: '2024-01-24T16:10:00Z',
  },
  {
    id: 'thread-3',
    title: 'Groupe Projet Collaboratif',
    participants: mockUsers.slice(0, 3),
    updatedAt: '2024-01-23T11:30:00Z',
  },
];

// Current user simulation
export const getCurrentMockUser = (): User => {
  // Vous pouvez changer cet index pour tester différents rôles
  // 0: ETUDIANT, 1: ALTERNANT, 2: TUTEUR, 3: RESP_PLATEFORME
  return mockUsers[0];
};

// Helper functions for filtering data by user
export const getMockRequirementsForUser = (user: User): Requirement[] => {
  return mockRequirements.filter(req => req.classId === user.classId);
};

export const getMockEventsForUser = (user: User): Event[] => {
  return mockEvents.filter(event => event.classId === user.classId);
};

export const getMockNotificationsForUser = (): Notification[] => {
  return mockNotifications;
};

export const getMockThreadsForUser = (): Thread[] => {
  return mockThreads;
};

export const getMockMessagesForThread = (threadId: string): Message[] => {
  return mockMessages.filter(msg => msg.threadId === threadId);
};