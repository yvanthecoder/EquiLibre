import { useQuery } from '@tanstack/react-query';
import { Class } from '../types/api';
import { classService } from '../services/api.service';

export const useClass = (classId?: string) => {
  const { data: classData, isLoading } = useQuery({
    queryKey: ['classes', classId],
    queryFn: () => classService.getClass(classId!),
    enabled: !!classId,
  });

  return {
    classData,
    isLoading,
  };
};
