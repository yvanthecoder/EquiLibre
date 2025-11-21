import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event, CreateEventRequest } from '../types/api';
import { classService } from '../services/api.service';
import toast from 'react-hot-toast';

export const useEvents = (classId?: string) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events', classId],
    queryFn: () => classService.getClassEvents(classId!),
    enabled: !!classId,
  });

  return {
    events,
    isLoading,
  };
};

export const useCreateEvent = (defaultClassId?: string) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateEventRequest & { classId?: string }) => {
      const classId = payload.classId || defaultClassId;
      if (!classId) {
        throw new Error('Classe requise pour créer un événement');
      }
      return classService.createEvent(classId, { ...payload, classId });
    },
    onSuccess: (data, variables) => {
      const classId = variables.classId || defaultClassId || '';
      // push optimiste pour affichage immédiat
      queryClient.setQueryData<Event[] | undefined>(['events', classId], (old) => {
        const next = (old || []).slice();
        next.push({
          id: data.id,
          title: data.title,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          type: data.type,
          classId: data.classId,
        });
        return next;
      });
      if (classId) {
        queryClient.invalidateQueries({ queryKey: ['events', classId] });
      }
      toast.success('Événement créé avec succès !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la création';
      toast.error(message);
    },
  });

  return {
    createEvent: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};

export const useUpdateEvent = (classId: string, eventId: string) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<CreateEventRequest>) =>
      classService.updateEvent(classId, eventId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', classId] });
      toast.success('Événement mis à jour !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => classService.deleteEvent(classId, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', classId] });
      toast.success('Événement supprimé !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    },
  });

  return {
    updateEvent: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteEvent: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
