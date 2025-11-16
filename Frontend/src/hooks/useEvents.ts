import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '../types/api';
// import api from '../lib/api';
import { getMockEventsForUser, getCurrentMockUser } from '../lib/mockData';
import toast from 'react-hot-toast';

// Mock mode flag
const USE_MOCK_DATA = true;

export const useEvents = (classId?: string) => {
  return useQuery({
    queryKey: ['events', classId],
    queryFn: async (): Promise<Event[]> => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        const currentUser = getCurrentMockUser();
        return getMockEventsForUser(currentUser);
      }
      // const { data } = await api.get(`/classes/${classId}/events`);
      // return data;
      return [];
    },
    enabled: !!classId,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Omit<Event, 'id'>) => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newEvent: Event = {
          ...event,
          id: 'event_' + Date.now(),
        };
        return newEvent;
      }
      // const { data } = await api.post(`/classes/${event.classId}/events`, event);
      // return data;
      throw new Error('Backend not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Événement créé avec succès !');
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    },
  });
};