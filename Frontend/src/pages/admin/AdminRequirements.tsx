import React, { useEffect, useMemo, useState } from 'react';
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
import { useClassesList } from '../../hooks/useUsers';

const toLocalInput = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const toEndOfDayISO = (value: string) => {
  if (!value) return value;
  const date = new Date(value);
  date.setHours(23, 59, 59, 0);
  return date.toISOString();
};

export const AdminRequirements: React.FC = () => {
  const { user } = useAuth();
  const { classes } = useClassesList();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const { requirements, isLoading } = useRequirements(selectedClassId);
  const { createRequirement, isCreating } = useCreateRequirement();
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  const { updateRequirement, deleteRequirement, isDeleting, isUpdating } = useUpdateRequirement(selectedReq || '');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateRequirementRequest>();

  useEffect(() => {
    if (!selectedClassId && classes?.length) {
      setSelectedClassId(classes[0].id);
    } else if (!selectedClassId && user?.classId) {
      setSelectedClassId(user.classId);
    }
  }, [classes, selectedClassId, user?.classId]);

  const classOptions = useMemo(() => classes || [], [classes]);

  const onSubmit = (data: CreateRequirementRequest) => {
    const payload = {
      ...data,
      classId: selectedClassId || user?.classId || '',
      dueDate: toEndOfDayISO(data.dueDate),
    };

    if (selectedReq) {
      updateRequirement(payload, {
        onSuccess: () => {
          setShowCreateModal(false);
          setSelectedReq(null);
          reset();
        },
      });
    } else {
      createRequirement(payload);
      setShowCreateModal(false);
      reset();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette exigence ?')) {
      setSelectedReq(id);
      deleteRequirement();
    }
  };

  const handleEdit = (req: any) => {
    setSelectedReq(req.id);
    setShowCreateModal(true);
    reset({
      title: req.title,
      description: req.description,
      dueDate: toLocalInput(req.dueDate),
      classId: req.classId,
    });
    if (req.classId) {
      setSelectedClassId(req.classId);
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
            onClick={() => handleEdit(row)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row.id)}
            disabled={isDeleting}
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
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>← Retour</Button>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des exigences</h1>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {classOptions.map((cls: any) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => { setSelectedReq(null); setShowCreateModal(true); }}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvelle exigence
        </Button>
      </div>

      <Card>
        {isLoading || !selectedClassId ? (
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          reset();
          setSelectedReq(null);
        }}
        title={selectedReq ? 'Modifier une exigence' : 'Créer une exigence'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {classOptions.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                reset();
                setSelectedReq(null);
              }}
            >
              Annuler
            </Button>
            <Button type="submit" isLoading={isCreating || isUpdating}>
              {selectedReq ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
