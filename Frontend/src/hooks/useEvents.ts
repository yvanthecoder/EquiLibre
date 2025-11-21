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

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateEventRequest & { classId: string }) =>
      classService.createEvent(payload.classId, payload),
    onSuccess: (data, variables) => {
      // push optimiste pour affichage immédiat
      queryClient.setQueryData<Event[] | undefined>(['events', variables.classId], (old) => {
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
      queryClient.invalidateQueries({ queryKey: ['events', variables.classId] });
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
