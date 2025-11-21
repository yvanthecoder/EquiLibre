import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import toast from 'react-hot-toast';
import { useCreateEvent } from '../../hooks/useEvents';
import { CreateEventRequest } from '../../types/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classId?: string;
}

export const CreateEventModal: React.FC<Props> = ({ isOpen, onClose, classId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<'COURSE' | 'EXAM' | 'DEADLINE' | 'MEETING'>('COURSE');

  const { createEvent, isCreating } = useCreateEvent(classId || '');

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Le titre est requis');
      return;
    }
    if (!startDate) {
      toast.error('La date de début est requise');
      return;
    }
    if (!endDate) {
      toast.error('La date de fin est requise');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('La date de début doit être avant la date de fin');
      return;
    }
    if (!classId) {
      toast.error('Classe non trouvée. Veuillez vous reconnecter.');
      return;
    }

    const data: CreateEventRequest = {
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate,
      classId,
      type,
    };

    createEvent(data, {
      onSuccess: () => {
        setTitle('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setType('COURSE');
        toast.success('Événement créé avec succès');
        onClose();
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || 'Erreur lors de la création';
        toast.error(message);
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un événement" size="md">
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
              placeholder="Titre de l'événement"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnel)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'événement"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'événement
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={type}
              onChange={(e) => setType(e.target.value as 'COURSE' | 'EXAM' | 'DEADLINE' | 'MEETING')}
            >
              <option value="COURSE">Cours</option>
              <option value="EXAM">Examen</option>
              <option value="DEADLINE">Deadline</option>
              <option value="MEETING">Réunion</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
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

export default CreateEventModal;
