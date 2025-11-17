import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useEvents, useCreateEvent, useUpdateEvent } from '../../hooks/useEvents';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Table } from '../../components/UI/Table';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CreateEventRequest } from '../../types/api';

export const AdminCalendar: React.FC = () => {
  const { user } = useAuth();
  const { events, isLoading } = useEvents(user?.classId);
  const { createEvent, isCreating } = useCreateEvent(user?.classId || '');

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const { updateEvent, deleteEvent } = useUpdateEvent(user?.classId || '', selectedEvent || '');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateEventRequest>();

  const onSubmit = (data: CreateEventRequest) => {
    createEvent({
      ...data,
      classId: user?.classId || '',
    });
    setShowCreateModal(false);
    reset();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      setSelectedEvent(id);
      deleteEvent();
    }
  };

  const eventTypeLabels = {
    COURSE: 'Cours',
    EXAM: 'Examen',
    DEADLINE: 'Échéance',
    MEETING: 'Réunion',
  };

  const columns = [
    {
      header: 'Titre',
      accessor: 'title' as const,
    },
    {
      header: 'Type',
      accessor: (row: any) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
          {eventTypeLabels[row.type as keyof typeof eventTypeLabels]}
        </span>
      ),
    },
    {
      header: 'Date début',
      accessor: (row: any) => format(new Date(row.startDate), 'dd/MM/yyyy HH:mm', { locale: fr }),
    },
    {
      header: 'Date fin',
      accessor: (row: any) => format(new Date(row.endDate), 'dd/MM/yyyy HH:mm', { locale: fr }),
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Show edit modal
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion du calendrier</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvel événement
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table
            data={events || []}
            columns={columns}
            emptyMessage="Aucun événement créé"
          />
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          reset();
        }}
        title="Créer un événement"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              {...register('title', { required: 'Titre requis' })}
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              {...register('type', { required: 'Type requis' })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Sélectionner un type</option>
              <option value="COURSE">Cours</option>
              <option value="EXAM">Examen</option>
              <option value="DEADLINE">Échéance</option>
              <option value="MEETING">Réunion</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date début *
              </label>
              <input
                {...register('startDate', { required: 'Date de début requise' })}
                type="datetime-local"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date fin *
              </label>
              <input
                {...register('endDate', { required: 'Date de fin requise' })}
                type="datetime-local"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                reset();
              }}
            >
              Annuler
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Créer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
