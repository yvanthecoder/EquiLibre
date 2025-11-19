/**
 * Service d'authentification
 * Gère la communication avec l'API backend pour l'authentification
 */

import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import type { LoginResponse, User, ApiResponse } from '../types/user';

/**
 * Se connecter
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur de connexion');
  }

  return response.json();
};

/**
 * S'inscrire
 */
export const register = async (data: {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  role: string;
  company?: string;
  phone?: string;
}): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de l\'inscription');
  }

  return response.json();
};

/**
 * Obtenir le profil de l'utilisateur connecté
 */
export const getMe = async (token: string): Promise<ApiResponse<User>> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ME}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la récupération du profil');
  }

  return response.json();
};

/**
 * Mettre à jour le profil
 */
export const updateProfile = async (
  token: string,
  data: Partial<User>
): Promise<ApiResponse<User>> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_PROFILE}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la mise à jour du profil');
  }

  return response.json();
};

/**
 * Sauvegarder le token dans localStorage
 */
export const saveToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Récupérer le token depuis localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Supprimer le token (déconnexion)
 */
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Vérifier si l'utilisateur est connecté
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};
