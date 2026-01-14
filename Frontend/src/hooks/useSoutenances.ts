import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Soutenance } from '../types/api';
import { soutenanceService } from '../services/api.service';
import toast from 'react-hot-toast';

export const useSoutenances = (classId?: string) => {
  return useQuery({
    queryKey: ['soutenances', classId],
    queryFn: () => soutenanceService.getSoutenances(classId),
  });
};

export const useCreateSoutenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Soutenance> & { classId: string; title: string; scheduledAt: string }) =>
      soutenanceService.createSoutenance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soutenances'] });
      toast.success('Soutenance créée');
    },
  });
};

export const useUpdateSoutenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Soutenance> }) =>
      soutenanceService.updateSoutenance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soutenances'] });
      toast.success('Soutenance mise à jour');
    },
  });
};

export const useDeleteSoutenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => soutenanceService.deleteSoutenance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soutenances'] });
      toast.success('Soutenance supprimée');
    },
  });
};

export const useSoutenanceJury = (soutenanceId?: string) => {
  return useQuery({
    queryKey: ['soutenances', soutenanceId, 'jury'],
    queryFn: () => soutenanceService.listJury(soutenanceId!),
    enabled: !!soutenanceId,
  });
};

export const useAddSoutenanceJury = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ soutenanceId, userId }: { soutenanceId: string; userId: string }) =>
      soutenanceService.addJury(soutenanceId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['soutenances', variables.soutenanceId, 'jury'] });
      toast.success('Membre du jury ajouté');
    },
  });
};

export const useRemoveSoutenanceJury = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ soutenanceId, userId }: { soutenanceId: string; userId: string }) =>
      soutenanceService.removeJury(soutenanceId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['soutenances', variables.soutenanceId, 'jury'] });
      toast.success('Membre du jury retiré');
    },
  });
};
