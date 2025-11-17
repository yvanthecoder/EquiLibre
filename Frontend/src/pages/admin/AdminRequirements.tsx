import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRequirements, useCreateRequirement, useUpdateRequirement } from '../../hooks/useRequirements';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Table } from '../../components/UI/Table';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CreateRequirementRequest } from '../../types/api';

export const AdminRequirements: React.FC = () => {
  const { user } = useAuth();
  const { requirements, isLoading } = useRequirements(user?.classId);
  const { createRequirement, isCreating } = useCreateRequirement();
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  const { updateRequirement, deleteRequirement } = useUpdateRequirement(selectedReq || '');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateRequirementRequest>();

  const onSubmit = (data: CreateRequirementRequest) => {
    createRequirement({
      ...data,
      classId: user?.classId || '',
    });
    setShowCreateModal(false);
    reset();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette exigence ?')) {
      setSelectedReq(id);
      deleteRequirement();
    }
  };

  const columns = [
    {
      header: 'Titre',
      accessor: 'title' as const,
    },
    {
      header: 'Description',
      accessor: (row: any) => (
        <span className="line-clamp-2">{row.description}</span>
      ),
    },
    {
      header: 'Date limite',
      accessor: (row: any) => format(new Date(row.dueDate), 'dd/MM/yyyy', { locale: fr }),
    },
    {
      header: 'Statut',
      accessor: (row: any) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Navigate to edit page or show edit modal
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des exigences</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvelle exigence
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table
            data={requirements || []}
            columns={columns}
            emptyMessage="Aucune exigence créée"
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
        title="Créer une exigence"
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
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description requise' })}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date limite *
            </label>
            <input
              {...register('dueDate', { required: 'Date requise' })}
              type="datetime-local"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
            )}
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
