import React, { useState } from 'react';
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Table } from '../../components/UI/Table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export const AdminUsers: React.FC = () => {
  const { users, isLoading } = useUsers();
  const { deleteUser, isDeleting } = useDeleteUser();

  const roleLabels = {
    ALTERNANT: 'Alternant',
    ETUDIANT: 'Étudiant',
    TUTEUR: 'Tuteur',
    MAITRE_APP: "Maître d'apprentissage",
    RESP_PLATEFORME: 'Responsable',
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser(userId);
    }
  };

  const columns = [
    {
      header: 'Nom',
      accessor: (row: any) => `${row.firstName} ${row.lastName}`,
    },
    {
      header: 'Email',
      accessor: 'email' as const,
    },
    {
      header: 'Rôle',
      accessor: (row: any) => (
        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
          {roleLabels[row.role as keyof typeof roleLabels]}
        </span>
      ),
    },
    {
      header: 'Créé le',
      accessor: (row: any) => format(new Date(row.createdAt), 'dd/MM/yyyy', { locale: fr }),
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Navigate to edit page
            }}
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table
            data={users || []}
            columns={columns}
            emptyMessage="Aucun utilisateur trouvé"
          />
        )}
      </Card>
    </div>
  );
};
