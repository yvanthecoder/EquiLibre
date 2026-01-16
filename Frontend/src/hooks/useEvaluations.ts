import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Evaluation, EvaluationGrid } from '../types/api';
import { evaluationGridService, evaluationService } from '../services/api.service';
import toast from 'react-hot-toast';

export const useEvaluationGrids = () => {
  return useQuery({
    queryKey: ['evaluation-grids'],
    queryFn: evaluationGridService.getGrids,
  });
};

export const useCreateEvaluationGrid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<EvaluationGrid>) => evaluationGridService.createGrid(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-grids'] });
      toast.success('Grille créée');
    },
  });
};

export const useUpdateEvaluationGrid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EvaluationGrid> }) =>
      evaluationGridService.updateGrid(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-grids'] });
      toast.success('Grille mise à jour');
    },
  });
};

export const useDeleteEvaluationGrid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gridId: string) => evaluationGridService.deleteGrid(gridId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-grids'] });
      toast.success('Grille supprimée');
    },
  });
};

export const useEvaluationsForStudent = (studentId?: string) => {
  return useQuery({
    queryKey: ['evaluations', 'student', studentId],
    queryFn: () => evaluationService.getStudentEvaluations(studentId!),
    enabled: !!studentId,
  });
};

export const useCreateEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => evaluationService.createEvaluation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      toast.success('Évaluation enregistrée');
    },
  });
};
