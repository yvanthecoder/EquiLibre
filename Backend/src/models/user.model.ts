import { RowDataPacket } from 'mysql2';

export interface User extends RowDataPacket {
  id: number;
  email: string;
  password?: string;
  googleId?: string;
  name: string;
  created_at: Date;
  updated_at?: Date;
}

export interface UserPayload {
  id: number;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}
