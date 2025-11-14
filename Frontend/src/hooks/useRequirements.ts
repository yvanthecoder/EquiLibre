import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Requirement, Submission } from '../types/api';
// import api from '../lib/api';
import { getMockRequirementsForUser, getCurrentMockUser } from '../lib/mockData';
import toast from 'react-hot-toast';

// Mock mode flag
const USE_MOCK_DATA = true;

export const useRequirements = (classId?: string) => {
  return useQuery({
    queryKey: ['requirements', classId],
    queryFn: async (): Promise<Requirement[]> => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        const currentUser = getCurrentMockUser();
        return getMockRequirementsForUser(currentUser);
      }
      // const { data } = await api.get(`/classes/${classId}/requirements`);
      // return data;
      return [];
    },
    enabled: !!classId,
  });
};

export const useRequirement = (id: string) => {
  return useQuery({
    queryKey: ['requirements', id],
    queryFn: async (): Promise<Requirement> => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        const currentUser = getCurrentMockUser();
        const requirements = getMockRequirementsForUser(currentUser);
        const requirement = requirements.find(r => r.id === id);
        if (!requirement) throw new Error('Requirement not found');
        return requirement;
      }
      // const { data } = await api.get(`/requirements/${id}`);
      // return data;
      throw new Error('Backend not implemented');
    },
    enabled: !!id,
  });
};

export const useSubmitRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requirementId, file }: { requirementId: string; file: File }) => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate successful submission
        const currentUser = getCurrentMockUser();
        const submission: Submission = {
          id: 'sub_' + Date.now(),
          requirementId,
          userId: currentUser.id,
          filePath: `/uploads/${file.name}`,
          fileName: file.name,
          status: 'SUBMITTED',
          submittedAt: new Date().toISOString(),
        };
        return submission;
      }
      
      // const formData = new FormData();
      // formData.append('file', file);
      // const { data } = await api.post(`/requirements/${requirementId}/submissions`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
      // return data;
      throw new Error('Backend not implemented');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', variables.requirementId] });
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success('Fichier soumis avec succès !');
    },
    onError: () => {
      toast.error('Erreur lors de la soumission');
    },
  });
};

export const useCreateRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requirement: Omit<Requirement, 'id' | 'createdAt'>) => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newRequirement: Requirement = {
          ...requirement,
          id: 'req_' + Date.now(),
          createdAt: new Date().toISOString(),
          submissions: [],
        };
        return newRequirement;
      }
      // const { data } = await api.post('/requirements', requirement);
      // return data;
      throw new Error('Backend not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success('Exigence créée avec succès !');
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    },
  });
};