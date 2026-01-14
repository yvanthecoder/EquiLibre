import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Journal } from '../types/api';
import { journalService } from '../services/api.service';
import toast from 'react-hot-toast';

export const useMyJournals = () => {
  return useQuery({
    queryKey: ['journals', 'me'],
    queryFn: journalService.getMyJournals,
  });
};

export const useClassJournals = (classId?: string) => {
  return useQuery({
    queryKey: ['journals', 'class', classId],
    queryFn: () => journalService.getClassJournals(classId!),
    enabled: !!classId,
  });
};

export const useCreateJournal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Journal>) => journalService.createJournal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast.success('Journal créé');
    },
  });
};

export const useUpdateJournal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Journal> }) =>
      journalService.updateJournal(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast.success('Journal mis à jour');
    },
  });
};

export const useSubmitJournal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journalService.submitJournal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast.success('Journal soumis');
    },
  });
};

export const useValidateJournal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: 'VALIDATED' | 'ARCHIVED'; comment?: string }) =>
      journalService.validateJournal(id, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast.success('Statut du journal mis à jour');
    },
  });
};
