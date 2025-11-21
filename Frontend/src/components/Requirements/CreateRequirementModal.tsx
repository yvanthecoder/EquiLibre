import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import toast from 'react-hot-toast';
import { useCreateRequirement } from '../../hooks/useRequirements';
import { CreateRequirementRequest } from '../../types/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classId?: string;
}

export const CreateRequirementModal: React.FC<Props> = ({ isOpen, onClose, classId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const { createRequirement, isCreating } = useCreateRequirement();

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Le titre est requis');
      return;
    }
    if (!dueDate) {
      toast.error('La date limite est requise');
      return;
    }
    if (!classId) {
      toast.error('Classe non trouvée. Veuillez vous reconnecter.');
      return;
    }

    const dateIso = new Date(`${dueDate}T23:59:59`).toISOString();

    const data: CreateRequirementRequest = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dateIso,
      classId,
    };

    createRequirement(data, {
      onSuccess: () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        toast.success('Exigence créée avec succès');
        onClose();
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || 'Erreur lors de la création';
        toast.error(message);
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une exigence" size="md">
      {!classId ? (
        <div className="space-y-4 text-center py-6">
          <p className="text-red-600 font-medium">⚠️ Classe non trouvée</p>
          <p className="text-gray-600 text-sm">
            Vous n'êtes pas assigné à une classe. Veuillez contacter un administrateur pour assigner une classe à votre compte.
          </p>
          <Button variant="outline" onClick={onClose} className="w-full">
            Fermer
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'exigence"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'exigence"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date limite
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
              Annuler
            </Button>
            <Button variant="primary" isLoading={isCreating} onClick={handleCreate}>
              Créer
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CreateRequirementModal;
