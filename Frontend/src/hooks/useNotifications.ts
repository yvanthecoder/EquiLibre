import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '../types/api';
import { notificationService } from '../services/api.service';

export const useNotifications = () => {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return {
    notifications,
    isLoading,
    unreadCount,
  };
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    markAsRead: markReadMutation.mutate,
  };
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    markAllAsRead: markAllReadMutation.mutate,
    isMarking: markAllReadMutation.isPending,
  };
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    deleteNotification: deleteMutation.mutate,
  };
};
