import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useClassesList, useUsers, useClassMembers } from '../hooks/useUsers';
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
import toast from 'react-hot-toast';

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
  const isStudent = user?.role === 'ALTERNANT' || user?.role === 'ETUDIANT_CLASSIQUE';
  const { classes = [] } = useClassesList();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const { members = [] } = useClassMembers(selectedClassId);
  const { data: soutenances = [] } = useSoutenances(isAdmin ? { classId: selectedClassId || undefined } : undefined);
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

  const studentOptions = useMemo(() => {
    const fromMembers = (members || []).filter((m: any) => ['ALTERNANT', 'ETUDIANT_CLASSIQUE'].includes(m.role));
    if (fromMembers.length) return fromMembers;
    if (!isAdmin || !selectedClassId) return fromMembers;
    return (users || []).filter(
      (u: any) =>
        ['ALTERNANT', 'ETUDIANT_CLASSIQUE'].includes(u.role) &&
        u.classId?.toString() === selectedClassId.toString()
    );
  }, [members, users, isAdmin, selectedClassId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [studentId, setStudentId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'PLANNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'EVALUATED' | 'ARCHIVED'>('PLANNED');

  React.useEffect(() => {
    if (isAdmin && !selectedClassId && classes.length === 1) {
      setSelectedClassId(classes[0].id);
    }
  }, [isAdmin, selectedClassId, classes]);

  const columns = useMemo(() => {
    if (isStudent) {
      return [
        {
          header: 'Date / heure',
          accessor: (row: any) => format(new Date(row.scheduledAt), 'dd/MM/yyyy HH:mm', { locale: fr }),
        },
        {
          header: 'Lieu',
          accessor: (row: any) => row.location || '-',
        },
        {
          header: 'Jury',
          accessor: (row: any) => {
            const members = row.juryMembers || [];
            if (!members.length) return '-';
            return members.map((m: any) => `${m.firstname} ${m.lastname}`).join(', ');
          },
        },
        {
          header: 'Statut',
          accessor: (row: any) => statusLabels[row.status] || row.status,
        },
        {
          header: 'Note',
          accessor: (row: any) =>
            row.validatedScore !== null && row.validatedScore !== undefined
              ? Number(row.validatedScore).toFixed(2)
              : '-',
        },
      ];
    }

    return [
      {
        header: 'Etudiant',
        accessor: (row: any) =>
          row.studentFirstName && row.studentLastName
            ? `${row.studentFirstName} ${row.studentLastName}`
            : row.studentId ? `#${row.studentId}` : '-',
      },
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
                    setStudentId(row.studentId?.toString() || '');
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
    ];
  }, [isStudent, canCreate, classNameById, deleteSoutenance, deleting]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isStudent ? 'Mes Rendez-vous' : 'Soutenances'}
          </h1>
          <p className="text-gray-600">
            {isStudent
              ? 'Consultez les soutenances planifiees pour vous'
              : 'Planification et convocations des soutenances'}
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setSelectedSoutenance(null);
              setStudentId('');
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
              <option value="">Toutes les classes</option>
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
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setStudentId('');
              }}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Etudiant</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={!selectedClassId}
            >
              <option value="">
                {selectedClassId ? 'Sélectionner' : 'Sélectionner une classe'}
              </option>
              {selectedClassId && studentOptions.length === 0 && (
                <option value="" disabled>
                  Aucun étudiant dans cette classe
                </option>
              )}
              {studentOptions.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
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
                if (!selectedClassId) {
                  toast.error('Selectionnez une classe');
                  return;
                }
                if (!studentId) {
                  toast.error('Selectionnez un etudiant');
                  return;
                }
                if (!title || !scheduledAt) {
                  toast.error('Titre et date requis');
                  return;
                }
                if (selectedSoutenance) {
                  updateSoutenance({
                    id: selectedSoutenance.id,
                    payload: { studentId, title, scheduledAt, location, status },
                  });
                } else {
                  createSoutenance({ studentId, title, scheduledAt, location, status });
                }
                setIsModalOpen(false);
                setSelectedSoutenance(null);
                setStudentId('');
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
