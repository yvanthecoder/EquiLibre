import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRequirements, useSubmitRequirement } from '../hooks/useRequirements';
import { useClassesList } from '../hooks/useUsers';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { StatusBadge } from '../components/UI/StatusBadge';
import { DocumentArrowUpIcon, EyeIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assignmentService, requirementService } from '../services/api.service';
import toast from 'react-hot-toast';

export const Requirements: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTutor = user?.role === 'TUTEUR_ECOLE';
  const isMaitre = user?.role === 'MAITRE_APP';
  const canReview = isTutor || isMaitre;
  const { classes = [] } = useClassesList();
  const [selectedClassId, setSelectedClassId] = useState(user?.classId || '');
  const classId = canReview ? selectedClassId : user?.classId;
  const { requirements, isLoading } = useRequirements(classId);
  const submitRequirement = useSubmitRequirement();
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});
  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', 'mine'],
    queryFn: () => assignmentService.getAllAssignments(),
    enabled: canReview,
  });

  useEffect(() => {
    if (!canReview) return;
    if (!selectedClassId && classes.length) {
      setSelectedClassId(classes[0].id);
    }
  }, [canReview, selectedClassId, classes]);

  const assignedStudentIds = useMemo(() => {
    if (!canReview) return new Set<string>();
    return new Set(
      (assignments || [])
        .filter((assignment: any) => {
          if (!assignment?.student_id) return false;
          if (selectedClassId && assignment.class_id?.toString() !== selectedClassId) return false;
          return true;
        })
        .map((assignment: any) => assignment.student_id.toString())
    );
  }, [assignments, canReview, selectedClassId]);

  const reviewRequirements = useMemo(() => {
    if (!canReview) return [];
    return (requirements || [])
      .map((requirement: any) => {
        const submissions = (requirement.submissions || []).filter((sub: any) =>
          assignedStudentIds.has(sub.userId)
        );
        return { ...requirement, submissions };
      })
      .filter((requirement: any) => (requirement.submissions || []).length > 0);
  }, [requirements, canReview, assignedStudentIds]);

  const handleDownload = async (requirementId: string, submissionId: string, fileName?: string) => {
    try {
      const blob = await requirementService.downloadSubmission(requirementId, submissionId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document';
      link.rel = 'noopener';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors du telechargement';
      toast.error(message);
    }
  };

  const handleFileSelect = (requirementId: string, file: File) => {
    setSelectedFiles((prev) => ({ ...prev, [requirementId]: file }));
  };

  const handleSubmit = (requirementId: string) => {
    const file = selectedFiles[requirementId];
    if (file) {
      submitRequirement.mutate({ requirementId, file });
      setSelectedFiles((prev) => {
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

  if (user?.role === 'ETUDIANT_CLASSIQUE') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exigences</h1>
          <p className="text-gray-600">
            {canReview
              ? 'Consultez les soumissions de vos alternants et lancez une evaluation'
              : 'Consultez et soumettez vos travaux pour chaque exigence'}
          </p>
        </div>
        {canReview && classes.length > 1 && (
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            {classes.map((cls: any) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {canReview ? (
        <div className="space-y-4">
          {!classId ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-600">Aucune classe disponible pour afficher les exigences.</p>
              </div>
            </Card>
          ) : reviewRequirements.length ? (
            reviewRequirements.map((requirement: any) => (
              <Card key={requirement.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{requirement.title}</h3>
                      <StatusBadge status={requirement.status} />
                    </div>
                    <p className="text-gray-600 mb-3">{requirement.description}</p>
                    <div className="text-sm text-gray-500">
                      A%chAcance : {format(new Date(requirement.dueDate), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {(requirement.submissions || []).map((submission: any) => (
                    <div key={submission.id} className="flex items-center justify-between rounded-md border p-3 bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">
                          {submission.firstname || submission.lastname
                            ? `${submission.firstname || ''} ${submission.lastname || ''}`.trim()
                            : `Etudiant #${submission.userId}`}
                        </p>
                        <p className="text-sm text-gray-600">{submission.fileName}</p>
                        <p className="text-xs text-gray-500">
                          Soumis le {format(new Date(submission.submittedAt), 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={submission.status} size="sm" />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(requirement.id, submission.id, submission.fileName)}
                        >
                          Consulter
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/evaluations?studentId=${submission.userId}&contextType=REQUIREMENT&contextId=${requirement.id}`
                            )
                          }
                        >
                          Evaluer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <div className="text-center py-12">
                <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune soumission</h3>
                <p className="text-gray-600">Aucune soumission d'alternant pour le moment.</p>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {requirements?.length ? (
            requirements.map((requirement) => {
              const userSubmission = requirement.submissions?.find((sub) => sub.userId === user?.id);
              const canSubmit = requirement.status !== 'LOCKED' && !userSubmission;
              const selectedFile = selectedFiles[requirement.id];

              return (
                <Card key={requirement.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{requirement.title}</h3>
                        <StatusBadge status={userSubmission?.status || requirement.status} />
                      </div>

                      <p className="text-gray-600 mb-3">{requirement.description}</p>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>
                          A%chAcance : {format(new Date(requirement.dueDate), 'dd/MM/yyyy', { locale: fr })}
                        </span>
                        {userSubmission && (
                          <span>
                            Soumis le : {format(new Date(userSubmission.submittedAt), 'dd/MM/yyyy', { locale: fr })}
                          </span>
                        )}
                      </div>

                      {userSubmission?.feedback && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>Commentaire :</strong> {userSubmission.feedback}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
                      {userSubmission ? (
                        <div className="flex items-center gap-2">
                          <EyeIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{userSubmission.fileName}</span>
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
                            <Button size="sm" onClick={() => handleSubmit(requirement.id)} isLoading={submitRequirement.isPending}>
                              <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                              Soumettre
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {requirement.status === 'LOCKED' ? 'VerrouillAc' : 'DAcjAÿ soumis'}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune exigence</h3>
                <p className="text-gray-600">
                  Aucune exigence n'a ActAc crAcAce pour votre classe pour le moment.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};