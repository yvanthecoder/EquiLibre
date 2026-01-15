import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useClassesList, useUsers } from '../hooks/useUsers';
import {
  useSoutenances,
  useCreateSoutenance,
  useDeleteSoutenance,
  useUpdateSoutenance,
  useSoutenanceJury,
  useAddSoutenanceJury,
  useRemoveSoutenanceJury,
} from '../hooks/useSoutenances';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { Table } from '../components/UI/Table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  PLANNED: 'Planifiée',
  CONFIRMED: 'Confirmée',
  IN_PROGRESS: 'En cours',
  EVALUATED: 'Évaluée',
  ARCHIVED: 'Archivée',
};

export const Soutenances: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { classes = [] } = useClassesList();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const { data: soutenances = [] } = useSoutenances(isAdmin ? selectedClassId || undefined : undefined);
  const { mutate: createSoutenance, isPending: creating } = useCreateSoutenance();
  const { mutate: updateSoutenance, isPending: updating } = useUpdateSoutenance();
  const { mutate: deleteSoutenance, isPending: deleting } = useDeleteSoutenance();

  const { users = [] } = useUsers(isAdmin);
  const [selectedSoutenance, setSelectedSoutenance] = useState<any | null>(null);
  const [showJuryModal, setShowJuryModal] = useState(false);
  const { data: juryMembers = [] } = useSoutenanceJury(selectedSoutenance?.id?.toString());
  const { mutate: addJuryMember, isPending: addingJury } = useAddSoutenanceJury();
  const { mutate: removeJuryMember, isPending: removingJury } = useRemoveSoutenanceJury();
  const [selectedJuryUserId, setSelectedJuryUserId] = useState('');

  const canCreate = isAdmin;

  const classNameById = useMemo(() => {
    return (classes || []).reduce((acc: Record<string, string>, cls: any) => {
      acc[cls.id?.toString()] = cls.name;
      return acc;
    }, {});
  }, [classes]);

  const juryCandidates = useMemo(() => {
    return (users || []).filter((u: any) => ['JURY', 'INTERVENANT', 'TUTEUR_ECOLE'].includes(u.role));
  }, [users]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'PLANNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'EVALUATED' | 'ARCHIVED'>('PLANNED');

  React.useEffect(() => {
    if (isAdmin && !selectedClassId && classes.length) {
      setSelectedClassId(classes[0].id);
    }
  }, [isAdmin, selectedClassId, classes]);

  const columns = useMemo(
    () => [
      {
        header: 'Titre',
        accessor: 'title' as const,
      },
      {
        header: 'Classe',
        accessor: (row: any) => classNameById[row.classId?.toString()] || `#${row.classId}`,
      },
      {
        header: 'Date',
        accessor: (row: any) => format(new Date(row.scheduledAt), 'dd/MM/yyyy HH:mm', { locale: fr }),
      },
      {
        header: 'Statut',
        accessor: (row: any) => statusLabels[row.status] || row.status,
      },
      {
        header: 'Actions',
        accessor: (row: any) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedSoutenance(row);
                setShowJuryModal(true);
              }}
            >
              Jury
            </Button>
            {canCreate ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedSoutenance(row);
                    setSelectedClassId(row.classId?.toString() || '');
                    setTitle(row.title || '');
                    setScheduledAt(row.scheduledAt ? row.scheduledAt.slice(0, 16) : '');
                    setLocation(row.location || '');
                    setStatus(row.status || 'PLANNED');
                    setIsModalOpen(true);
                  }}
                >
                  Modifier
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteSoutenance(row.id)} disabled={deleting}>
                  Supprimer
                </Button>
              </>
            ) : null}
          </div>
        ),
      },
    ],
    [canCreate, classNameById, deleteSoutenance, deleting]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soutenances</h1>
          <p className="text-gray-600">Planification et convocations des soutenances</p>
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setSelectedSoutenance(null);
              setTitle('');
              setScheduledAt('');
              setLocation('');
              setStatus('PLANNED');
              setIsModalOpen(true);
            }}
          >
            Nouvelle soutenance
          </Button>
        )}
      </div>

      <Card>
        {isAdmin && (
          <div className="flex items-center gap-3 mb-4">
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
        <Table data={soutenances || []} columns={columns} emptyMessage="Aucune soutenance" />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSoutenance ? 'Modifier une soutenance' : 'Créer une soutenance'}
      >
        <div className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
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
              <option value="PLANNED">Planifiée</option>
              <option value="CONFIRMED">Confirmée</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="EVALUATED">Évaluée</option>
              <option value="ARCHIVED">Archivée</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button
              isLoading={creating || updating}
              onClick={() => {
                if (!selectedClassId || !title || !scheduledAt) return;
                if (selectedSoutenance) {
                  updateSoutenance({
                    id: selectedSoutenance.id,
                    payload: { classId: selectedClassId, title, scheduledAt, location, status },
                  });
                } else {
                  createSoutenance({ classId: selectedClassId, title, scheduledAt, location, status });
                }
                setIsModalOpen(false);
                setSelectedSoutenance(null);
                setTitle('');
                setScheduledAt('');
                setLocation('');
                setStatus('PLANNED');
              }}
            >
              {selectedSoutenance ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showJuryModal}
        onClose={() => {
          setShowJuryModal(false);
          setSelectedSoutenance(null);
          setSelectedJuryUserId('');
        }}
        title="Jury de soutenance"
      >
        <div className="space-y-4">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <select
                value={selectedJuryUserId}
                onChange={(e) => setSelectedJuryUserId(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionner un membre</option>
                {juryCandidates.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.role})
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                isLoading={addingJury}
                onClick={() => {
                  if (!selectedSoutenance?.id || !selectedJuryUserId) return;
                  const alreadyAssigned = juryMembers.some((m: any) => m.id?.toString() === selectedJuryUserId);
                  if (alreadyAssigned) return;
                  addJuryMember({
                    soutenanceId: selectedSoutenance.id.toString(),
                    userId: selectedJuryUserId,
                  });
                  setSelectedJuryUserId('');
                }}
              >
                Ajouter
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {juryMembers.length === 0 ? (
              <p className="text-sm text-gray-600">Aucun membre du jury.</p>
            ) : (
              juryMembers.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between rounded-md border p-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.firstname} {member.lastname}
                    </p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={removingJury}
                      onClick={() => {
                        if (!selectedSoutenance?.id) return;
                        removeJuryMember({
                          soutenanceId: selectedSoutenance.id.toString(),
                          userId: member.id.toString(),
                        });
                      }}
                    >
                      Retirer
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
