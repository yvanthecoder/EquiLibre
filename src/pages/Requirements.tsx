import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRequirements, useSubmitRequirement } from '../hooks/useRequirements';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { StatusBadge } from '../components/UI/StatusBadge';
import { DocumentArrowUpIcon, EyeIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Requirements: React.FC = () => {
  const { user } = useAuth();
  const { data: requirements, isLoading } = useRequirements(user?.classId);
  const submitRequirement = useSubmitRequirement();
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});

  const handleFileSelect = (requirementId: string, file: File) => {
    setSelectedFiles(prev => ({ ...prev, [requirementId]: file }));
  };

  const handleSubmit = (requirementId: string) => {
    const file = selectedFiles[requirementId];
    if (file) {
      submitRequirement.mutate({ requirementId, file });
      setSelectedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[requirementId];
        return newFiles;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exigences</h1>
        <p className="text-gray-600">
          Consultez et soumettez vos travaux pour chaque exigence
        </p>
      </div>

      <div className="space-y-4">
        {requirements?.length ? (
          requirements.map(requirement => {
            const userSubmission = requirement.submissions?.find(
              sub => sub.userId === user?.id
            );
            const canSubmit = requirement.status !== 'LOCKED' && !userSubmission;
            const selectedFile = selectedFiles[requirement.id];

            return (
              <Card key={requirement.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {requirement.title}
                      </h3>
                      <StatusBadge 
                        status={userSubmission?.status || requirement.status} 
                      />
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      {requirement.description}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>
                        Échéance: {format(new Date(requirement.dueDate), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                      {userSubmission && (
                        <span>
                          Soumis le: {format(new Date(userSubmission.submittedAt), 'dd/MM/yyyy', { locale: fr })}
                        </span>
                      )}
                    </div>

                    {userSubmission?.feedback && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          <strong>Commentaire:</strong> {userSubmission.feedback}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    {userSubmission ? (
                      <div className="flex items-center gap-2">
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {userSubmission.fileName}
                        </span>
                      </div>
                    ) : canSubmit ? (
                      <div className="space-y-2">
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(requirement.id, file);
                          }}
                          className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          accept=".pdf,.doc,.docx,.txt"
                        />
                        
                        {selectedFile && (
                          <Button
                            size="sm"
                            onClick={() => handleSubmit(requirement.id)}
                            isLoading={submitRequirement.isPending}
                          >
                            <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                            Soumettre
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        {requirement.status === 'LOCKED' ? 'Verrouillé' : 'Déjà soumis'}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <div className="text-center py-12">
              <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune exigence
              </h3>
              <p className="text-gray-600">
                Aucune exigence n'a été créée pour votre classe pour le moment.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};