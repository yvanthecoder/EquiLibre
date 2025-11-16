import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Thread, Message } from '../types/api';
// import api from '../lib/api';
import { getMockThreadsForUser, getMockMessagesForThread } from '../lib/mockData';
import toast from 'react-hot-toast';

// Mock mode flag
const USE_MOCK_DATA = true;

export const useThreads = () => {
  return useQuery({
    queryKey: ['threads'],
    queryFn: async (): Promise<Thread[]> => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return getMockThreadsForUser();
      }
      // const { data } = await api.get('/threads');
      // return data;
      return [];
    },
  });
};

export const useMessages = (threadId: string) => {
  return useQuery({
    queryKey: ['messages', threadId],
    queryFn: async (): Promise<Message[]> => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return getMockMessagesForThread(threadId);
      }
      // const { data } = await api.get(`/threads/${threadId}/messages`);
      // return data;
      return [];
    },
    enabled: !!threadId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, content }: { threadId: string; content: string }) => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newMessage: Message = {
          id: 'msg_' + Date.now(),
          threadId,
          senderId: 'current-user-id',
          sender: {
            id: 'current-user-id',
            email: 'current@example.com',
            firstName: 'Current',
            lastName: 'User',
            role: 'ETUDIANT',
            createdAt: new Date().toISOString(),
          },
          content,
          createdAt: new Date().toISOString(),
        };
        return newMessage;
      }
      // const { data } = await api.post(`/threads/${threadId}/messages`, { content });
      // return data;
      throw new Error('Backend not implemented');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      toast.success('Message envoyé !');
    },
    onError: () => {
      toast.error('Erreur lors de l\'envoi du message');
    },
  });
};