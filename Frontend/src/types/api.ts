export interface Requirement {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'VALIDATED' | 'REJECTED' | 'LOCKED';
  classId: string;
  submissions?: Submission[];
  createdAt: string;
}

export interface Submission {
  id: string;
  requirementId: string;
  userId: string;
  filePath: string;
  fileName: string;
  status: 'SUBMITTED' | 'VALIDATED' | 'REJECTED';
  feedback?: string;
  submittedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  classId: string;
  type: 'COURSE' | 'EXAM' | 'DEADLINE' | 'MEETING';
}

export interface Thread {
  id: string;
  title: string;
  participants: User[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  sender: User;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  read: boolean;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  members: User[];
  instructors: User[];
}

export interface File {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  userId: string;
  classId?: string;
  uploadedAt: string;
}

export interface CreateRequirementRequest {
  title: string;
  description: string;
  dueDate: string;
  classId: string;
}

export interface UpdateRequirementRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: 'PENDING' | 'SUBMITTED' | 'VALIDATED' | 'REJECTED' | 'LOCKED';
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  classId: string;
  type: 'COURSE' | 'EXAM' | 'DEADLINE' | 'MEETING';
}

export interface CreateThreadRequest {
  title: string;
  participantIds: string[];
  initialMessage: string;
}

export interface SendMessageRequest {
  threadId: string;
  content: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

export type UserRole = 'ALTERNANT' | 'ETUDIANT_CLASSIQUE' | 'TUTEUR_ECOLE' | 'MAITRE_APP' | 'ADMIN';

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
  company?: string;
  phone?: string;
  jobTitle?: string;
  classId?: string;
}