import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useInterviews, useCreateInterview, useDeleteInterview, useUpdateInterview } from '../hooks/useInterviews';
import { useUsers, useClassesList, useClassMembers } from '../hooks/useUsers';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { Table } from '../components/UI/Table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  PROPOSED: 'Proposé',
  PLANNED: 'Planifié',
  CONFIRMED: 'Confirmé',
  COMPLETED: 'Terminé',
  ARCHIVED: 'Archivé',
};

export const Interviews: React.FC = () => {
  const { user } = useAuth();
  const { data: interviews = [] } = useInterviews();
  const canCreate = ['ADMIN', 'TUTEUR_ECOLE', 'MAITRE_APP', 'INTERVENANT'].includes(user?.role || '');
  const isAdmin = user?.role === 'ADMIN';
  const { users = [] } = useUsers(canCreate && isAdmin);
  const { classes = [] } = useClassesList();
  const [selectedClassId, setSelectedClassId] = useState('');
  const { members = [] } = useClassMembers(!isAdmin ? selectedClassId : undefined);
  const { mutate: createInterview, isPending: creating } = useCreateInterview();
  const { mutate: updateInterview, isPending: updating } = useUpdateInterview();
  const { mutate: deleteInterview } = useDeleteInterview();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<any | null>(null);
  const [studentId, setStudentId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'PROPOSED' | 'PLANNED' | 'CONFIRMED' | 'COMPLETED' | 'ARCHIVED'>('PLANNED');
  const [summary, setSummary] = useState('');

  React.useEffect(() => {
    if (!isAdmin && canCreate && !selectedClassId && classes.length) {
      setSelectedClassId(classes[0].id);
    }
  }, [isAdmin, canCreate, selectedClassId, classes]);

  const studentOptions = useMemo(() => {
    const source = isAdmin ? users : members;
    return (source || []).filter((u: any) => ['ALTERNANT', 'ETUDIANT_CLASSIQUE'].includes(u.role));
  }, [isAdmin, users, members]);

  const columns = [
    {
      header: 'Date',
      accessor: (row: any) => format(new Date(row.scheduledAt), 'dd/MM/yyyy HH:mm', { locale: fr }),
    },
    {
      header: 'Statut',
      accessor: (row: any) => statusLabels[row.status] || row.status,
    },
    {
      header: 'Lieu',
      accessor: (row: any) => row.location || '-',
    },
    {
      header: 'Actions',
      accessor: (row: any) =>
        canCreate ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingInterview(row);
                setStudentId(row.studentId?.toString() || '');
                setScheduledAt(row.scheduledAt ? row.scheduledAt.slice(0, 16) : '');
                setLocation(row.location || '');
                setStatus(row.status || 'PLANNED');
                setSummary(row.summary || '');
                setIsModalOpen(true);
              }}
            >
              Modifier
            </Button>
            <Button size="sm" variant="outline" onClick={() => deleteInterview(row.id)}>
              Supprimer
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entretiens semestriels</h1>
          <p className="text-gray-600">Planification et suivi des entretiens</p>
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setEditingInterview(null);
              setStudentId('');
              setScheduledAt('');
              setLocation('');
              setStatus('PLANNED');
              setSummary('');
              setIsModalOpen(true);
            }}
          >
            Planifier
          </Button>
        )}
      </div>

      <Card>
        {!isAdmin && canCreate && (
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm text-gray-600">Classe :</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Sélectionner</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <Table data={interviews || []} columns={columns} emptyMessage="Aucun entretien" />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInterview ? 'Modifier un entretien' : 'Planifier un entretien'}
      >
        <div className="space-y-4">
          {!isAdmin && canCreate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionner</option>
                {classes.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Étudiant</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={!isAdmin && canCreate && !selectedClassId}
            >
              <option value="">
                {isAdmin || selectedClassId ? 'Sélectionner' : 'Sélectionner une classe'}
              </option>
              {studentOptions.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="PROPOSED">Proposé</option>
              <option value="PLANNED">Planifié</option>
              <option value="CONFIRMED">Confirmé</option>
              <option value="COMPLETED">Terminé</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compte rendu</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button
              isLoading={creating || updating}
              onClick={() => {
                if (!studentId || !scheduledAt) return;
                if (editingInterview) {
                  updateInterview({
                    id: editingInterview.id,
                    payload: { studentId, scheduledAt, location, status, summary },
                  });
                } else {
                  createInterview({ studentId, scheduledAt, location, status, summary });
                }
                setIsModalOpen(false);
                setEditingInterview(null);
                setStudentId('');
                setScheduledAt('');
                setLocation('');
                setStatus('PLANNED');
                setSummary('');
              }}
            >
              {editingInterview ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
