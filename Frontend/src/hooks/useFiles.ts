import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { File } from '../types/api';
import { fileService } from '../services/api.service';
import toast from 'react-hot-toast';

export const usePersonalFiles = () => {
  const { data: files, isLoading } = useQuery({
    queryKey: ['files', 'personal'],
    queryFn: fileService.getPersonalFiles,
  });

  return {
    files,
    isLoading,
  };
};

export const useClassFiles = (classId?: string) => {
  const { data: files, isLoading } = useQuery({
    queryKey: ['files', 'class', classId],
    queryFn: () => fileService.getClassFiles(classId!),
    enabled: !!classId,
  });

  return {
    files,
    isLoading,
  };
};

export const useSharedFiles = () => {
  const { data: files, isLoading } = useQuery({
    queryKey: ['files', 'shared'],
    queryFn: fileService.getSharedFiles,
  });

  return { files, isLoading };
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({ file, classId, visibilityRole, requiresSignature, parentFileId, version }: { file: File; classId?: string; visibilityRole?: string; requiresSignature?: boolean; parentFileId?: string; version?: number }) =>
      fileService.uploadFile(file, classId, { visibilityRole, requiresSignature, parentFileId, version }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['files', 'personal'] });
      queryClient.invalidateQueries({ queryKey: ['files', 'class'] });
      queryClient.invalidateQueries({ queryKey: ['files', 'shared'] });
      toast.success('Fichier téléchargé avec succès !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors du téléchargement';
      toast.error(message);
    },
  });

  return {
    uploadFile: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
  };
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => fileService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['files', 'personal'] });
      queryClient.invalidateQueries({ queryKey: ['files', 'class'] });
      queryClient.invalidateQueries({ queryKey: ['files', 'shared'] });
      toast.success('Fichier supprimé !');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    },
  });

  return {
    deleteFile: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

export const useDownloadFile = () => {
  const downloadMutation = useMutation({
    mutationFn: async ({ fileId, fileName }: { fileId: string; fileName: string }) => {
      const blob = await fileService.downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors du téléchargement';
      toast.error(message);
    },
  });

  return {
    downloadFile: downloadMutation.mutate,
    isDownloading: downloadMutation.isPending,
  };
};
