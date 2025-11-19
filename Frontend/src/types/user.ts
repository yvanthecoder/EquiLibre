/**
 * Types TypeScript pour l'application EquiLibre
 */

// Les 5 rôles de l'application
export type UserRole =
  | 'ALTERNANT'
  | 'ETUDIANT_CLASSIQUE'
  | 'MAITRE_APP'
  | 'TUTEUR_ECOLE'
  | 'ADMIN';

// Interface User
export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  role: UserRole;
  company?: string | null;
  phone?: string | null;
  profile_picture?: string | null;
  created_at?: string;
  last_login?: string;
  is_active?: boolean;
  is_verified?: boolean;
}

// Interface pour la réponse de login
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// Interface pour la réponse d'API générique
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Interface pour les erreurs API
export interface ApiError {
  success: false;
  message: string;
  detail?: string;
}
