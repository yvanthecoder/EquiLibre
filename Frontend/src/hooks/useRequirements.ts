import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Requirement,
  CreateRequirementRequest,
  UpdateRequirementRequest,
  Submission,
} from '../types/api';
import { requirementService, classService } from '../services/api.service';
import toast from 'react-hot-toast';

export const useRequirements = (classId?: string) => {
  const queryClient = useQueryClient();

  // Fetch all requirements for a class
  const { data: requirements, isLoading } = useQuery({
    queryKey: ['requirements', classId],
    queryFn: () => classService.getClassRequirements(classId!),
    enabled: !!classId,
  });

  return {
    requirements,
    isLoading,
  };
};

export const useRequirement = (requirementId?: string) => {
  const queryClient = useQueryClient();

  // Fetch single requirement
  const { data: requirement, isLoading } = useQuery({
    queryKey: ['requirements', requirementId],
    queryFn: () => requirementService.getRequirement(requirementId!),
    enabled: !!requirementId,
  });

  // Fetch submissions for a requirement
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['requirements', requirementId, 'submissions'],
    queryFn: () => requirementService.getSubmissions(requirementId!),
    enabled: !!requirementId,
  });

  // Submit requirement mutation
  const submitMutation = useMutation({
    mutationFn: (file: File) => requirementService.submitRequirement(requirementId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', requirementId, 'submissions'] });
      toast.success('Document soumis avec succès !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la soumission';
      toast.error(message);
    },
  });

  // Update submission status mutation (for instructors)
  const updateSubmissionStatusMutation = useMutation({
    mutationFn: ({
      submissionId,
      status,
      feedback,
    }: {
      submissionId: string;
      status: 'VALIDATED' | 'REJECTED';
      feedback?: string;
    }) => requirementService.updateSubmissionStatus(requirementId!, submissionId, status, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', requirementId, 'submissions'] });
      toast.success('Statut mis à jour !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    },
  });

  return {
    requirement,
    isLoading,
    submissions,
    isLoadingSubmissions,
    submitRequirement: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    updateSubmissionStatus: updateSubmissionStatusMutation.mutate,
    isUpdatingStatus: updateSubmissionStatusMutation.isPending,
  };
};

export const useCreateRequirement = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateRequirementRequest) => requirementService.createRequirement(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', variables.classId] });
      toast.success('Exigence créée avec succès !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la création';
      toast.error(message);
    },
  });

  return {
    createRequirement: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};

export const useUpdateRequirement = (requirementId: string) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: UpdateRequirementRequest) =>
      requirementService.updateRequirement(requirementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', requirementId] });
      toast.success('Exigence mise à jour !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => requirementService.deleteRequirement(requirementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success('Exigence supprimée !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    },
  });

  return {
    updateRequirement: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteRequirement: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

// Hook for submitting a requirement (student side)
export const useSubmitRequirement = () => {
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: ({ requirementId, file }: { requirementId: string; file: File }) =>
      requirementService.submitRequirement(requirementId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['requirements', variables.requirementId, 'submissions']
      });
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success('Document soumis avec succès !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la soumission';
      toast.error(message);
    },
  });

  return submitMutation;
};
