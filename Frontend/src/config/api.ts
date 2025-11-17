/**
 * Configuration de l'API Backend
 */

// URL du backend (depuis les variables d'environnement Vite)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',
  UPDATE_PROFILE: '/api/auth/profile',

  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: number) => `/api/users/${id}`,

  // Classes
  CLASSES: '/api/classes',
  CLASS_BY_ID: (id: number) => `/api/classes/${id}`,
  CLASS_MEMBERS: (id: number) => `/api/classes/${id}/members`,
  ADD_CLASS_MEMBER: (id: number) => `/api/classes/${id}/members`,
  REMOVE_CLASS_MEMBER: (classId: number, userId: number) =>
    `/api/classes/${classId}/members/${userId}`,

  // Requirements
  REQUIREMENTS: '/api/requirements',
  REQUIREMENT_BY_ID: (id: number) => `/api/requirements/${id}`,
  VALIDATE_REQUIREMENT: (id: number) => `/api/requirements/${id}/validate`,
  REQUIREMENT_STATS: (classId: number) => `/api/requirements/stats/${classId}`,
};

// Configuration axios par défaut
export const API_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Obtenir l'URL complète d'un endpoint
 */
export const getFullUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Obtenir les headers avec le token JWT
 */
export const getAuthHeaders = (token?: string | null): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};
