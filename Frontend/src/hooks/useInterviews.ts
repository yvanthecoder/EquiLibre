import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Interview } from '../types/api';
import { interviewService } from '../services/api.service';
import toast from 'react-hot-toast';

export const useInterviews = () => {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: interviewService.getInterviews,
  });
};

export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Interview> & { studentId: string; scheduledAt: string }) =>
      interviewService.createInterview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Entretien créé');
    },
  });
};

export const useUpdateInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Interview> }) =>
      interviewService.updateInterview(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Entretien mis à jour');
    },
  });
};

export const useDeleteInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => interviewService.deleteInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Entretien supprimé');
    },
  });
};
