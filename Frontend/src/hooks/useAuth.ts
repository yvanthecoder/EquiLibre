import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, LoginRequest, RegisterRequest, AuthTokens } from '../types/user';
// import api from '../lib/api';
import { getCurrentMockUser, mockUsers } from '../lib/mockData';
import toast from 'react-hot-toast';

// Mock mode flag - set to false when backend is ready
const USE_MOCK_DATA = true;

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<User | null> => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const token = localStorage.getItem('mock_access_token');
        if (token) {
          return getCurrentMockUser();
        }
        return null;
      }
      // const { data } = await api.get('/auth/me');
      // return data;
      return null;
    },
    enabled: USE_MOCK_DATA ? !!localStorage.getItem('mock_access_token') : !!localStorage.getItem('access_token'),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find user by email (simple mock validation)
        const user = mockUsers.find(u => u.email === credentials.email);
        if (user && credentials.password.length >= 6) {
          return {
            user,
            tokens: {
              access_token: 'mock_access_token_' + user.id,
              refresh_token: 'mock_refresh_token_' + user.id,
            },
          };
        }
        throw new Error('Invalid credentials');
      }
      // const { data } = await api.post('/auth/login', credentials);
      // return data;
      throw new Error('Backend not implemented');
    },
    onSuccess: ({ user, tokens }) => {
      if (USE_MOCK_DATA) {
        localStorage.setItem('mock_access_token', tokens.access_token);
        localStorage.setItem('mock_refresh_token', tokens.refresh_token);
      } else {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
      queryClient.setQueryData(['auth', 'me'], user);
      toast.success(`Bienvenue ${user.firstName} !`);
    },
    onError: () => {
      toast.error('Identifiants incorrects');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create new mock user
        const newUser: User = {
          id: 'user_' + Date.now(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          classId: 'class-1', // Default class for demo
          createdAt: new Date().toISOString(),
        };
        
        return {
          user: newUser,
          tokens: {
            access_token: 'mock_access_token_' + newUser.id,
            refresh_token: 'mock_refresh_token_' + newUser.id,
          },
        };
      }
      // const { data: response } = await api.post('/auth/register', data);
      // return response;
      throw new Error('Backend not implemented');
    },
    onSuccess: ({ user, tokens }) => {
      if (USE_MOCK_DATA) {
        localStorage.setItem('mock_access_token', tokens.access_token);
        localStorage.setItem('mock_refresh_token', tokens.refresh_token);
      } else {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
      queryClient.setQueryData(['auth', 'me'], user);
      toast.success('Compte créé avec succès !');
    },
    onError: () => {
      toast.error('Erreur lors de la création du compte');
    },
  });

  const logout = () => {
    if (USE_MOCK_DATA) {
      localStorage.removeItem('mock_access_token');
      localStorage.removeItem('mock_refresh_token');
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    queryClient.clear();
    window.location.href = '/login';
  };

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isAuthenticated: !!user,
  };
};