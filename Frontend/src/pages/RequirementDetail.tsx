import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRequirement } from '../hooks/useRequirements';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { StatusBadge } from '../components/UI/StatusBadge';
import { FileUpload } from '../components/UI/FileUpload';
import { Modal } from '../components/UI/Modal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

export const RequirementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const {
    requirement,
    isLoading,
    submissions,
    isLoadingSubmissions,
    submitRequirement,
    isSubmitting,
    updateSubmissionStatus,
    isUpdatingStatus,
  } = useRequirement(id);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const isInstructor = user?.role === 'TUTEUR' || user?.role === 'MAITRE_APP' || user?.role === 'RESP_PLATEFORME';
  const isStudent = user?.role === 'ETUDIANT' || user?.role === 'ALTERNANT';

  const handleSubmit = () => {
    if (selectedFile) {
      submitRequirement(selectedFile);
      setShowSubmitModal(false);
      setSelectedFile(null);
    }
  };

  const handleUpdateStatus = (submissionId: string, status: 'VALIDATED' | 'REJECTED') => {
    updateSubmissionStatus({ submissionId, status, feedback });
    setShowFeedbackModal(false);
    setFeedback('');
    setSelectedSubmission(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Exigence non trouvée</p>
        <Link to="/requirements" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Retour aux exigences
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/requirements"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour
        </Link>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{requirement.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Créé le {format(new Date(requirement.createdAt), 'dd/MM/yyyy', { locale: fr })}
              </p>
            </div>
            <StatusBadge status={requirement.status} />
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{requirement.description}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900">Date limite</h3>
            <p className="text-gray-600">
              {format(new Date(requirement.dueDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
            </p>
          </div>

          {isStudent && requirement.status !== 'LOCKED' && (
            <Button onClick={() => setShowSubmitModal(true)}>
              Soumettre un document
            </Button>
          )}
        </div>
      </Card>

      {/* Submissions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isInstructor ? 'Soumissions des étudiants' : 'Mes soumissions'}
        </h2>

        {isLoadingSubmissions ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : submissions && submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{submission.fileName}</p>
                      <p className="text-sm text-gray-500">
                        Soumis le {format(new Date(submission.submittedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </p>
                      {submission.feedback && (
                        <p className="text-sm text-gray-600 mt-1">
                          Feedback: {submission.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={submission.status} size="sm" />

                  {isInstructor && submission.status === 'SUBMITTED' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          setSelectedSubmission(submission.id);
                          setShowFeedbackModal(true);
                        }}
                      >
                        Valider
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setSelectedSubmission(submission.id);
                          setShowFeedbackModal(true);
                        }}
                      >
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Aucune soumission pour le moment</p>
        )}
      </Card>

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Soumettre un document"
      >
        <div className="space-y-4">
          <FileUpload
            onFileSelect={setSelectedFile}
            accept=".pdf,.doc,.docx"
            maxSize={10}
            label="Cliquez ou déposez un fichier ici"
          />

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile}
              isLoading={isSubmitting}
            >
              Soumettre
            </Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Ajouter un feedback"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ajoutez un commentaire..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>
              Annuler
            </Button>
            <Button
              variant="success"
              onClick={() => handleUpdateStatus(selectedSubmission!, 'VALIDATED')}
              isLoading={isUpdatingStatus}
            >
              Valider
            </Button>
            <Button
              variant="danger"
              onClick={() => handleUpdateStatus(selectedSubmission!, 'REJECTED')}
              isLoading={isUpdatingStatus}
            >
              Rejeter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
