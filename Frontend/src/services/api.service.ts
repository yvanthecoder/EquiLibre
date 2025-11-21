import api from '../lib/api';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthTokens,
  Requirement,
  Submission,
  Event,
  Thread,
  Message,
  Notification,
  Class,
  File,
  CreateRequirementRequest,
  UpdateRequirementRequest,
  CreateEventRequest,
  CreateThreadRequest,
  SendMessageRequest,
  UpdateUserRequest,
} from '../types/api';

// ==================== AUTH ENDPOINTS ====================

export const authService = {
  login: async (credentials: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post('/auth/login', credentials);
    // Transform backend response: { success, data: { token, user } }
    // to frontend format: { user, tokens: { access_token, refresh_token } }
    const { token, user: backendUser } = response.data.data;
    return {
      user: {
        id: backendUser.id.toString(),
        email: backendUser.email,
        firstName: backendUser.firstname,
        lastName: backendUser.lastname,
        role: backendUser.role,
        avatar: backendUser.profile_picture,
        createdAt: backendUser.created_at,
      },
      tokens: {
        access_token: token,
        refresh_token: token, // Backend uses single token for now
      },
    };
  },

  register: async (userData: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> => {
    // Transform camelCase to lowercase for backend compatibility
    const backendData: any = {
      email: userData.email,
      password: userData.password,
      firstname: userData.firstName,
      lastname: userData.lastName,
      role: userData.role,
      company: userData.company,
      phone: userData.phone,
    };

    // Add jobTitle and classId if they exist
    if (userData.jobTitle) {
      backendData.jobTitle = userData.jobTitle;
    }
    if (userData.classId) {
      backendData.classId = userData.classId;
    }

    console.log('Sending registration data:', backendData);

    const response = await api.post('/auth/register', backendData);
    // Transform backend response: { success, data: { token, user } }
    // to frontend format: { user, tokens: { access_token, refresh_token } }
    const { token, user: backendUser } = response.data.data;
    return {
      user: {
        id: backendUser.id.toString(),
        email: backendUser.email,
        firstName: backendUser.firstname,
        lastName: backendUser.lastname,
        role: backendUser.role,
        avatar: backendUser.profile_picture,
        createdAt: backendUser.created_at,
      },
      tokens: {
        access_token: token,
        refresh_token: token, // Backend uses single token for now
      },
    };
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    // Backend doesn't have refresh endpoint yet, return same token
    return {
      access_token: refreshToken,
      refresh_token: refreshToken,
    };
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    const backendUser = response.data.data;
    return {
      id: backendUser.id.toString(),
      email: backendUser.email,
      firstName: backendUser.firstname,
      lastName: backendUser.lastname,
      role: backendUser.role,
      avatar: backendUser.profile_picture,
      classId: backendUser.class_id?.toString(),
      createdAt: backendUser.created_at,
      company: backendUser.company,
      phone: backendUser.phone,
    };
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  updateProfile: async (updates: {
    firstname: string;
    lastname: string;
    phone?: string;
    company?: string;
    profile_picture?: string;
    job_title?: string;
    class_id?: string | number | null;
  }): Promise<User> => {
    const response = await api.put('/auth/profile', updates);
    const data = response.data;
    return {
      id: data.id.toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      avatar: data.avatar,
      classId: data.classId?.toString(),
      createdAt: new Date().toISOString(),
    };
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { oldPassword, newPassword });
  },
};

// ==================== USER ENDPOINTS ====================

export const userService = {
  getUser: async (userId: string): Promise<User> => {
    const { data } = await api.get(`/users/${userId}`);
    return {
      id: data.id.toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      avatar: data.avatar,
      classId: data.classId?.toString(),
      createdAt: data.createdAt,
      company: data.company,
      phone: data.phone,
      jobTitle: data.jobTitle,
      isActive: data.isActive,
    };
  },

  updateUser: async (userId: string, updates: UpdateUserRequest): Promise<User> => {
    const { data } = await api.patch(`/users/${userId}`, updates);
    return {
      id: data.id.toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      avatar: data.avatar,
      classId: data.classId?.toString(),
      createdAt: data.createdAt,
      company: data.company,
      phone: data.phone,
      jobTitle: data.jobTitle,
      isActive: data.isActive,
    };
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  getAllUsers: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
  },

  createUser: async (payload: RegisterRequest): Promise<User> => {
    const backendData: any = {
      email: payload.email,
      password: payload.password,
      firstname: payload.firstName,
      lastname: payload.lastName,
      role: payload.role,
      company: payload.company,
      phone: payload.phone,
      jobTitle: payload.jobTitle,
      classId: payload.classId,
    };

    const { data } = await api.post('/auth/register', backendData);
    const newUser = data.data.user;
    return {
      id: newUser.id.toString(),
      email: newUser.email,
      firstName: newUser.firstname,
      lastName: newUser.lastname,
      role: newUser.role,
      classId: newUser.class_id?.toString(),
      createdAt: newUser.created_at || new Date().toISOString(),
      company: newUser.company,
      phone: newUser.phone,
      jobTitle: newUser.job_title,
      isActive: newUser.is_active,
    };
  },
};

// ==================== CLASS ENDPOINTS ====================

export const classService = {
  getClass: async (classId: string): Promise<Class> => {
    const { data } = await api.get(`/classes/${classId}`);
    return {
      id: data.id.toString(),
      name: data.name,
      description: data.description,
      members: data.members || [],
      instructors: data.instructors || [],
    };
  },

  getClassMembers: async (classId: string): Promise<User[]> => {
    const { data } = await api.get(`/classes/${classId}/members`);
    return data;
  },

  addClassMember: async (classId: string, userId: string): Promise<void> => {
    await api.post(`/classes/${classId}/members`, { userId });
  },

  removeClassMember: async (classId: string, userId: string): Promise<void> => {
    await api.delete(`/classes/${classId}/members/${userId}`);
  },

  getClassRequirements: async (classId: string): Promise<Requirement[]> => {
    const { data } = await api.get(`/classes/${classId}/requirements`);
    return (data || []).map((req: any) => ({
      id: req.id.toString(),
      title: req.title,
      description: req.description,
      dueDate: req.dueDate,
      status: req.status,
      classId: req.classId?.toString(),
      submissions: req.submissions?.map((sub: any) => ({
        id: sub.id.toString(),
        requirementId: sub.requirementId.toString(),
        userId: sub.userId.toString(),
        filePath: sub.filePath,
        fileName: sub.fileName,
        status: sub.status,
        feedback: sub.feedback,
        submittedAt: sub.submittedAt,
      })),
      createdAt: req.createdAt,
    }));
  },

  getClassEvents: async (classId: string): Promise<Event[]> => {
    const { data } = await api.get(`/classes/${classId}/events`);
    return (data || []).map((event: any) => ({
      id: event.id.toString(),
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      classId: event.classId?.toString(),
      type: event.type,
    }));
  },

  createEvent: async (classId: string, eventData: CreateEventRequest): Promise<Event> => {
    const { data } = await api.post(`/classes/${classId}/events`, eventData);
    return {
      id: data.id.toString(),
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      classId: data.classId?.toString(),
      type: data.type,
    };
  },

  getMyClasses: async (): Promise<{ id: string; name: string }[]> => {
    const { data } = await api.get('/classes');
    return (data || []).map((cls: any) => ({
      id: cls.id?.toString(),
      name: cls.name,
    }));
  },

  updateEvent: async (classId: string, eventId: string, updates: Partial<CreateEventRequest>): Promise<Event> => {
    const { data } = await api.patch(`/classes/${classId}/events/${eventId}`, updates);
    return {
      id: data.id.toString(),
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      classId: data.classId?.toString(),
      type: data.type,
    };
  },

  deleteEvent: async (classId: string, eventId: string): Promise<void> => {
    await api.delete(`/classes/${classId}/events/${eventId}`);
  },
};

// ==================== REQUIREMENT ENDPOINTS ====================

export const requirementService = {
  getRequirement: async (requirementId: string): Promise<Requirement> => {
    const { data } = await api.get(`/requirements/${requirementId}`);
    return {
      id: data.id.toString(),
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      status: data.status,
      classId: data.classId?.toString(),
      submissions: data.submissions,
      createdAt: data.createdAt,
    };
  },

  createRequirement: async (requirementData: CreateRequirementRequest): Promise<Requirement> => {
    const { data } = await api.post('/requirements', requirementData);
    return {
      id: data.id.toString(),
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      status: data.status,
      classId: data.classId?.toString(),
      createdAt: data.createdAt,
    };
  },

  updateRequirement: async (requirementId: string, updates: UpdateRequirementRequest): Promise<Requirement> => {
    const { data } = await api.patch(`/requirements/${requirementId}`, updates);
    return {
      id: data.id.toString(),
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      status: data.status,
      classId: data.classId?.toString(),
      createdAt: data.createdAt,
    };
  },

  deleteRequirement: async (requirementId: string): Promise<void> => {
    await api.delete(`/requirements/${requirementId}`);
  },

  getSubmissions: async (requirementId: string): Promise<Submission[]> => {
    const { data } = await api.get(`/requirements/${requirementId}/submissions`);
    return (data || []).map((sub: any) => ({
      id: sub.id.toString(),
      requirementId: sub.requirementId.toString(),
      userId: sub.userId.toString(),
      filePath: sub.filePath,
      fileName: sub.fileName,
      status: sub.status,
      feedback: sub.feedback,
      submittedAt: sub.submittedAt,
    }));
  },

  submitRequirement: async (requirementId: string, file: File): Promise<Submission> => {
    const formData = new FormData();
    formData.append('file', file as any);

    const { data } = await api.post(`/requirements/${requirementId}/submissions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      id: data.id.toString(),
      requirementId: data.requirementId.toString(),
      userId: data.userId.toString(),
      filePath: data.filePath,
      fileName: data.fileName,
      status: data.status,
      feedback: data.feedback,
      submittedAt: data.submittedAt,
    };
  },

  updateSubmissionStatus: async (
    requirementId: string,
    submissionId: string,
    status: 'VALIDATED' | 'REJECTED',
    feedback?: string
  ): Promise<Submission> => {
    const { data } = await api.patch(`/requirements/${requirementId}/submissions/${submissionId}`, {
      status,
      feedback,
    });
    return {
      id: data.id.toString(),
      requirementId: data.requirementId.toString(),
      userId: data.userId.toString(),
      filePath: data.filePath,
      fileName: data.fileName,
      status: data.status,
      feedback: data.feedback,
      submittedAt: data.submittedAt,
    };
  },
};

// ==================== FILE ENDPOINTS ====================

export const fileService = {
  getPersonalFiles: async (): Promise<File[]> => {
    const { data } = await api.get('/files/personal');
    return data;
  },

  getClassFiles: async (classId: string): Promise<File[]> => {
    const { data } = await api.get(`/files/class/${classId}`);
    return data;
  },

  uploadFile: async (file: File, classId?: string, options?: { visibilityRole?: string; requiresSignature?: boolean; parentFileId?: string; version?: number }): Promise<File> => {
    const formData = new FormData();
    formData.append('file', file as any);
    if (classId) {
      formData.append('classId', classId);
    }
    if (options?.visibilityRole) formData.append('visibilityRole', options.visibilityRole);
    if (options?.requiresSignature) formData.append('requiresSignature', 'true');
    if (options?.parentFileId) formData.append('parentFileId', options.parentFileId);
    if (options?.version) formData.append('version', options.version.toString());

    const { data } = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  },

  downloadFile: async (fileId: string): Promise<Blob> => {
    const { data } = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  signFile: async (fileId: string): Promise<void> => {
    await api.post(`/files/${fileId}/sign`);
  },

  getSignatures: async (fileId: string): Promise<any[]> => {
    const { data } = await api.get(`/files/${fileId}/signatures`);
    return data.data || data;
  },
};

// ==================== MESSAGE ENDPOINTS ====================

export const messageService = {
  // Get all users for creating new conversations
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/messages/users');
    const backendUsers = response.data.data;

    // Transform backend user format to frontend User format
    return backendUsers.map((backendUser: any) => ({
      id: backendUser.id.toString(),
      email: backendUser.email,
      firstName: backendUser.firstname,
      lastName: backendUser.lastname,
      role: backendUser.role,
      avatar: backendUser.profile_picture,
      classId: backendUser.class_id?.toString(),
      createdAt: backendUser.created_at || new Date().toISOString(),
    }));
  },

  // Get all conversations for the current user
  getConversations: async (): Promise<Thread[]> => {
    const response = await api.get('/messages/conversations');
    return response.data.data;
  },

  // Get a specific conversation info
  getConversationInfo: async (conversationId: string): Promise<Thread> => {
    const response = await api.get(`/messages/conversations/${conversationId}`);
    return response.data.data;
  },

  // Get all messages in a conversation
  getConversationMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await api.get(`/messages/conversations/${conversationId}/messages`);
    return response.data.data;
  },

  // Create a new conversation
  createConversation: async (participantIds: number[]): Promise<Thread> => {
    const response = await api.post('/messages/conversations', { participantIds });
    return response.data.data;
  },

  // Send a message in a conversation
  sendMessage: async (conversationId: number, content: string): Promise<Message> => {
    const response = await api.post('/messages/messages', { conversationId, content });
    return response.data.data;
  },

  // Mark conversation as read
  markConversationAsRead: async (conversationId: string): Promise<void> => {
    await api.patch(`/messages/conversations/${conversationId}/read`);
  },

  // Get unread message count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/messages/unread-count');
    return response.data.data.count;
  },

  // Delete a message (soft delete)
  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/messages/messages/${messageId}`);
  },

  // Legacy methods for backward compatibility
  getThreads: async (): Promise<Thread[]> => {
    return messageService.getConversations();
  },

  getThread: async (threadId: string): Promise<Thread> => {
    return messageService.getConversationInfo(threadId);
  },

  getThreadMessages: async (threadId: string): Promise<Message[]> => {
    return messageService.getConversationMessages(threadId);
  },

  createThread: async (threadData: CreateThreadRequest): Promise<Thread> => {
    // Extract participant IDs from threadData
    const participantIds = threadData.participants || [];
    return messageService.createConversation(participantIds);
  },

  markThreadAsRead: async (threadId: string): Promise<void> => {
    return messageService.markConversationAsRead(threadId);
  },
};

// ==================== NOTIFICATION ENDPOINTS ====================

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    // Backend returns { success: true, data: [...] }
    return response.data.data || [];
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};

// ==================== ASSIGNMENT ENDPOINTS ====================

export interface Assignment {
  id: number;
  student_id: number;
  maitre_id?: number | null;
  tuteur_id?: number | null;
  assigned_at: string;
  updated_at: string;
  // Student info
  student_firstname?: string;
  student_lastname?: string;
  student_email?: string;
  student_company?: string;
  student_role?: string;
  class_id?: number;
  class_name?: string;
  // Maître info
  maitre_firstname?: string;
  maitre_lastname?: string;
  maitre_email?: string;
  maitre_company?: string;
  maitre_phone?: string;
  // Tuteur info
  tuteur_firstname?: string;
  tuteur_lastname?: string;
  tuteur_email?: string;
  tuteur_phone?: string;
}

export interface CreateAssignmentRequest {
  studentId: number;
  maitreId?: number | null;
  tuteurId?: number | null;
}

export interface UpdateAssignmentRequest {
  maitreId?: number | null;
  tuteurId?: number | null;
}

export const assignmentService = {
  // Get all assignments (filtered by role)
  getAllAssignments: async (filters?: {
    studentId?: number;
    maitreId?: number;
    tuteurId?: number;
    classId?: number;
  }): Promise<Assignment[]> => {
    const params = new URLSearchParams();
    if (filters?.studentId) params.append('studentId', filters.studentId.toString());
    if (filters?.maitreId) params.append('maitreId', filters.maitreId.toString());
    if (filters?.tuteurId) params.append('tuteurId', filters.tuteurId.toString());
    if (filters?.classId) params.append('classId', filters.classId.toString());

    const response = await api.get(`/assignments${params.toString() ? `?${params}` : ''}`);
    return response.data.data;
  },

  // Get assignment by ID
  getAssignmentById: async (assignmentId: number): Promise<Assignment> => {
    const response = await api.get(`/assignments/${assignmentId}`);
    return response.data.data;
  },

  // Get my assignment (for students)
  getMyAssignment: async (): Promise<Assignment> => {
    const response = await api.get('/assignments/my-assignment');
    return response.data.data;
  },

  // Create new assignment (admin only)
  createAssignment: async (assignmentData: CreateAssignmentRequest): Promise<Assignment> => {
    const response = await api.post('/assignments', assignmentData);
    return response.data.data;
  },

  // Update assignment (admin only)
  updateAssignment: async (assignmentId: number, updates: UpdateAssignmentRequest): Promise<Assignment> => {
    const response = await api.put(`/assignments/${assignmentId}`, updates);
    return response.data.data;
  },

  // Delete assignment (admin only)
  deleteAssignment: async (assignmentId: number): Promise<void> => {
    await api.delete(`/assignments/${assignmentId}`);
  },

  // Get assignment statistics (admin only)
  getAssignmentStats: async (): Promise<{
    total_assignments: number;
    assigned_students: number;
    active_maitres: number;
    active_tuteurs: number;
    without_maitre: number;
    without_tuteur: number;
  }> => {
    const response = await api.get('/assignments/stats');
    return response.data.data;
  },

  getAssignmentHistory: async (assignmentId?: number): Promise<any[]> => {
    const url = assignmentId ? `/assignments/${assignmentId}/history` : '/assignments/history/all';
    const response = await api.get(url);
    return response.data.data || [];
  },

  // Get unassigned students (admin only)
  getUnassignedStudents: async (): Promise<any[]> => {
    const response = await api.get('/assignments/unassigned');
    return response.data.data;
  },

  // Get available maitres (admin only)
  getAvailableMaitres: async (): Promise<any[]> => {
    const response = await api.get('/assignments/available-maitres');
    return response.data.data;
  },

  // Get available tuteurs (admin only)
  getAvailableTuteurs: async (): Promise<any[]> => {
    const response = await api.get('/assignments/available-tuteurs');
    return response.data.data;
  },
};
