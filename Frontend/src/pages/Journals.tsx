import React, { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  useMyJournals,
  useClassJournals,
  useCreateJournal,
  useUpdateJournal,
  useSubmitJournal,
  useValidateJournal,
} from '../hooks/useJournals';
import { useClassesList } from '../hooks/useUsers';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { Table } from '../components/UI/Table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const statusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  IN_PROGRESS: 'En cours',
  SUBMITTED: 'Déposé',
  VALIDATED: 'Validé',
  ARCHIVED: 'Archivé',
};

export const Journals: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'ALTERNANT' || user?.role === 'ETUDIANT_CLASSIQUE';
  const isStaff = user?.role === 'TUTEUR_ECOLE' || user?.role === 'MAITRE_APP' || user?.role === 'ADMIN';
  const { classes } = useClassesList();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const { data: myJournals = [] } = useMyJournals();
  const { data: classJournals = [] } = useClassJournals(selectedClassId);
  const { mutate: createJournal, isPending: creating } = useCreateJournal();
  const { mutate: updateJournal, isPending: updating } = useUpdateJournal();
  const { mutate: submitJournal } = useSubmitJournal();
  const { mutate: validateJournal } = useValidateJournal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<any | null>(null);
  const [content, setContent] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);

  const hasInvalidPeriod = (start: string, end: string) => {
    if (!start || !end) return false;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return true;
    return startDate >= endDate;
  };

  React.useEffect(() => {
    if (isStaff && !selectedClassId && classes?.length) {
      setSelectedClassId(classes[0].id);
    }
  }, [isStaff, selectedClassId, classes]);

  const openJournal = useCallback((row: any, readOnly: boolean) => {
    setEditingJournal(row);
    setPeriodStart(row.periodStart ? format(new Date(row.periodStart), 'yyyy-MM-dd') : '');
    setPeriodEnd(row.periodEnd ? format(new Date(row.periodEnd), 'yyyy-MM-dd') : '');
    setContent(row.content || '');
    setIsReadOnly(readOnly);
    setIsModalOpen(true);
  }, []);

  const journalRows = isStudent ? myJournals : classJournals;

  const columns = useMemo(() => {
    const base = [
      ...(isStaff
        ? [
            {
              header: 'Étudiant',
              accessor: (row: any) => (row.firstname && row.lastname ? `${row.firstname} ${row.lastname}` : '-'),
            },
          ]
        : []),
      {
        header: 'Période',
        accessor: (row: any) => {
          const start = row.periodStart
            ? format(new Date(row.periodStart), 'dd/MM/yyyy', { locale: fr })
            : '-';
          const end = row.periodEnd ? format(new Date(row.periodEnd), 'dd/MM/yyyy', { locale: fr }) : '-';
          return `${start} au ${end}`;
        },
      },
      {
        header: 'Statut',
        accessor: (row: any) => statusLabels[row.status] || row.status,
      },
      {
        header: 'Dernière mise à jour',
        accessor: (row: any) =>
          row.updatedAt ? format(new Date(row.updatedAt), 'dd/MM/yyyy', { locale: fr }) : '-',
      },
      {
        header: 'Actions',
        accessor: (row: any) => (
          <div className="flex gap-2">
            {isStudent && row.status !== 'DRAFT' && (
              <Button size="sm" variant="outline" onClick={() => openJournal(row, true)}>
                Voir
              </Button>
            )}
            {isStudent && row.status === 'DRAFT' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    openJournal(row, false);
                  }}
                >
                  Éditer
                </Button>
                <Button size="sm" variant="outline" onClick={() => submitJournal(row.id)}>
                  Soumettre
                </Button>
              </>
            )}
            {isStaff && row.status !== 'DRAFT' && (
              <Button size="sm" variant="outline" onClick={() => openJournal(row, true)}>
                Voir
              </Button>
            )}
            {isStaff && row.status === 'SUBMITTED' && (
              <>
                <Button size="sm" variant="outline" onClick={() => validateJournal({ id: row.id, status: 'VALIDATED' })}>
                  Valider
                </Button>
                <Button size="sm" variant="outline" onClick={() => validateJournal({ id: row.id, status: 'ARCHIVED' })}>
                  Archiver
                </Button>
              </>
            )}
          </div>
        ),
      },
    ];
    return base;
  }, [isStudent, isStaff, openJournal, submitJournal, validateJournal]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journaux de formation</h1>
          <p className="text-gray-600">Suivi et validation des journaux</p>
        </div>
        {isStudent && (
          <Button
            onClick={() => {
              setEditingJournal(null);
              setContent('');
              setPeriodStart('');
              setPeriodEnd('');
              setIsReadOnly(false);
              setIsModalOpen(true);
            }}
          >
            Nouveau journal
          </Button>
        )}
      </div>

      {isStaff && (
        <Card>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Classe :</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Sélectionner</option>
              {(classes || []).map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      <Card>
        <Table data={journalRows || []} columns={columns} emptyMessage="Aucun journal disponible" />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJournal(null);
          setIsReadOnly(false);
        }}
        title={
          editingJournal
            ? isReadOnly
              ? 'Consulter un journal'
              : 'Modifier un journal'
            : 'Créer un journal'
        }
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Début de période</label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                disabled={isReadOnly}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin de période</label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                disabled={isReadOnly}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              readOnly={isReadOnly}
              className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                isReadOnly ? 'bg-gray-50' : ''
              }`}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingJournal(null);
                setIsReadOnly(false);
              }}
            >
              {isReadOnly ? 'Fermer' : 'Annuler'}
            </Button>
            {!isReadOnly && (
              <Button
                isLoading={creating || updating}
                onClick={() => {
                  if (hasInvalidPeriod(periodStart, periodEnd)) {
                    toast.error('La date de debut doit etre inferieure a la date de fin.');
                    return;
                  }
                  if (editingJournal) {
                    updateJournal({
                      id: editingJournal.id,
                      payload: { periodStart, periodEnd, content, status: 'DRAFT' },
                    });
                  } else {
                    createJournal({ periodStart, periodEnd, content, status: 'DRAFT' });
                  }
                  setIsModalOpen(false);
                  setEditingJournal(null);
                  setContent('');
                  setPeriodStart('');
                  setPeriodEnd('');
                  setIsReadOnly(false);
                }}
              >
                {editingJournal ? 'Mettre à jour' : 'Créer'}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
