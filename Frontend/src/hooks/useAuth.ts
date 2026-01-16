import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, LoginRequest, RegisterRequest } from '../types/api';
import { authService } from '../services/api.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<User | null> => {
      try {
        return await authService.getCurrentUser();
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(['auth', 'me'], user);
      toast.success(`Bienvenue ${user.firstName} !`);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Identifiants incorrects';
      toast.error(message);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(['auth', 'me'], user);
      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la création du compte';
      toast.error(message);
    },
  });

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      queryClient.clear();
      navigate('/login');
    }
  };

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isAuthenticated: !!user,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};
