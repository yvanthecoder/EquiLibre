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