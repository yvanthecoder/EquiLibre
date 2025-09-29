export type UserRole = 'ALTERNANT' | 'ETUDIANT' | 'TUTEUR' | 'MAITRE_APP' | 'RESP_PLATEFORME';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  classId?: string;
  createdAt: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}