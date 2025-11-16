import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '../types/api';
// import api from '../lib/api';
import { getMockNotificationsForUser } from '../lib/mockData';

// Mock mode flag
const USE_MOCK_DATA = true;

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<Notification[]> => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));
        return getMockNotificationsForUser();
      }
      // const { data } = await api.get('/notifications');
      // return data;
      return [];
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
      }
      // const { data } = await api.patch(`/notifications/${notificationId}/read`);
      // return data;
      throw new Error('Backend not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};