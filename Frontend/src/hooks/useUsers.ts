import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, UpdateUserRequest, RegisterRequest } from '../types/api';
import { userService, classService } from '../services/api.service';
import toast from 'react-hot-toast';

export const useUser = (userId?: string) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
  });

  return {
    user,
    isLoading,
  };
};

export const useUsers = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
  });

  return {
    users,
    isLoading,
  };
};

export const useClassMembers = (classId?: string) => {
  const { data: members, isLoading } = useQuery({
    queryKey: ['classes', classId, 'members'],
    queryFn: () => classService.getClassMembers(classId!),
    enabled: !!classId,
  });

  return {
    members,
    isLoading,
  };
};

export const useUpdateUser = (userId: string) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (updates: UpdateUserRequest) => userService.updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Profil mis à jour !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    },
  });

  return {
    updateUser: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur supprimé !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    },
  });

  return {
    deleteUser: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: RegisterRequest) => userService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur crAcAc !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la crAcation';
      toast.error(message);
    },
  });

  return {
    createUser: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};

export const useClassesList = () => {
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: classService.getMyClasses,
  });

  return {
    classes,
    isLoading,
  };
};
