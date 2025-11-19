import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Thread, Message, CreateThreadRequest, SendMessageRequest } from '../types/api';
import { messageService } from '../services/api.service';
import toast from 'react-hot-toast';

export const useThreads = () => {
  const { data: threads, isLoading } = useQuery({
    queryKey: ['threads'],
    queryFn: messageService.getThreads,
  });

  return {
    threads,
    isLoading,
  };
};

export const useThread = (threadId?: string) => {
  const { data: thread, isLoading } = useQuery({
    queryKey: ['threads', threadId],
    queryFn: () => messageService.getThread(threadId!),
    enabled: !!threadId,
  });

  return {
    thread,
    isLoading,
  };
};

export const useMessages = (threadId?: string) => {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', threadId],
    queryFn: () => messageService.getThreadMessages(threadId!),
    enabled: !!threadId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  return {
    messages,
    isLoading,
  };
};

export const useCreateThread = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (threadData: CreateThreadRequest) => messageService.createThread(threadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      toast.success('Conversation créée !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la création';
      toast.error(message);
    },
  });

  return {
    createThread: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: (messageData: SendMessageRequest) => messageService.sendMessage(messageData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erreur lors de l'envoi du message";
      toast.error(message);
    },
  });

  return {
    sendMessage: sendMutation.mutate,
    isSending: sendMutation.isPending,
  };
};

export const useMarkThreadAsRead = () => {
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: (threadId: string) => messageService.markThreadAsRead(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });

  return {
    markAsRead: markReadMutation.mutate,
  };
};
