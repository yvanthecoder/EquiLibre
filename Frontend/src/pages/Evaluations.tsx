import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUsers, useClassesList, useClassMembers } from '../hooks/useUsers';
import {
  useEvaluationGrids,
  useCreateEvaluation,
  useCreateEvaluationGrid,
  useUpdateEvaluationGrid,
  useDeleteEvaluationGrid,
} from '../hooks/useEvaluations';
import { useSoutenances } from '../hooks/useSoutenances';
import { useClassJournals } from '../hooks/useJournals';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Table } from '../components/UI/Table';
import { Modal } from '../components/UI/Modal';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService, classService, evaluationService, evaluationGridService } from '../services/api.service';

type CriteriaDraft = { label: string; maxScore: number; weight: number };

export const Evaluations: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isStudent = user?.role === 'ALTERNANT' || user?.role === 'ETUDIANT_CLASSIQUE';
  const isAdmin = user?.role === 'ADMIN';
  const isTutor = user?.role === 'TUTEUR_ECOLE';
  const isMaitre = user?.role === 'MAITRE_APP';
  const isJuryOrIntervenant = user?.role === 'JURY' || user?.role === 'INTERVENANT';
  const canManageGrids = isAdmin;
  const { users = [] } = useUsers(!isStudent && isAdmin);
  const { classes = [] } = useClassesList();
  const [selectedClassId, setSelectedClassId] = useState('');
  const { members = [] } = useClassMembers(!isAdmin ? selectedClassId : undefined);
  const { data: grids = [] } = useEvaluationGrids();
  const { mutate: createEvaluation, isPending: creating } = useCreateEvaluation();
  const { mutate: createGrid, isPending: creatingGrid } = useCreateEvaluationGrid();
  const { mutate: updateGrid, isPending: updatingGrid } = useUpdateEvaluationGrid();
  const { mutate: deleteGrid, isPending: deletingGrid } = useDeleteEvaluationGrid();

  const [studentId, setStudentId] = useState('');
  const [contextType, setContextType] = useState<'JOURNAL' | 'REQUIREMENT' | 'SOUTENANCE'>(
    isJuryOrIntervenant ? 'SOUTENANCE' : 'JOURNAL'
  );
  const [contextId, setContextId] = useState('');
  const [gridId, setGridId] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [selectedSoutenanceId, setSelectedSoutenanceId] = useState('');

  const [showGridModal, setShowGridModal] = useState(false);
  const [editingGrid, setEditingGrid] = useState<any | null>(null);
  const [gridName, setGridName] = useState('');
  const [gridDescription, setGridDescription] = useState('');
  const [criteria, setCriteria] = useState<CriteriaDraft[]>([{ label: '', maxScore: 20, weight: 1 }]);

  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const canCreate = ['ADMIN', 'TUTEUR_ECOLE', 'MAITRE_APP', 'JURY', 'INTERVENANT'].includes(user?.role || '');
  const { data: mySoutenances = [] } = useSoutenances();
  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', 'mine'],
    queryFn: () => assignmentService.getAllAssignments(),
    enabled: isTutor || isMaitre,
  });

  React.useEffect(() => {
    const studentParam = searchParams.get('studentId');
    const contextTypeParam = searchParams.get('contextType');
    const contextIdParam = searchParams.get('contextId');
    if (studentParam && studentParam !== studentId) {
      setStudentId(studentParam);
    }
    if (contextTypeParam && contextTypeParam !== contextType) {
      setContextType(contextTypeParam as any);
    }
    if (contextIdParam && contextIdParam !== contextId) {
      setContextId(contextIdParam);
    }
  }, [searchParams, studentId, contextType, contextId]);

  React.useEffect(() => {
    if (!(isTutor || isMaitre) || !studentId) return;
    const match = (assignments || []).find((assignment: any) => assignment.student_id?.toString() === studentId);
    if (match?.class_id && match.class_id.toString() !== selectedClassId) {
      setSelectedClassId(match.class_id.toString());
    }
  }, [assignments, studentId, isTutor, isMaitre, selectedClassId]);
  const { data: classJournals = [] } = useClassJournals(isTutor || isMaitre ? selectedClassId : undefined);
  const { data: classRequirements = [] } = useQuery({
    queryKey: ['requirements', 'class', selectedClassId],
    queryFn: () => classService.getClassRequirements(selectedClassId),
    enabled: (isTutor || isMaitre) && !!selectedClassId,
  });

  React.useEffect(() => {
    if (isJuryOrIntervenant && contextType === 'JOURNAL') {
      setContextType('SOUTENANCE');
    }
  }, [isJuryOrIntervenant, contextType]);

  React.useEffect(() => {
    if (!isJuryOrIntervenant) return;
    const selected = mySoutenances.find((s: any) => s.id?.toString() === selectedSoutenanceId);
    if (!selected) return;
    if (selected.studentId) {
      setStudentId(selected.studentId.toString());
    }
    if (contextType === 'SOUTENANCE') {
      setContextId(selected.id?.toString() || '');
    }
  }, [isJuryOrIntervenant, selectedSoutenanceId, mySoutenances, contextType]);

  React.useEffect(() => {
    if (!isAdmin && canCreate && !selectedClassId && classes.length) {
      setSelectedClassId(classes[0].id);
    }
  }, [isAdmin, canCreate, selectedClassId, classes]);

  const assignedStudents = useMemo(() => {
    if (!(isTutor || isMaitre)) return [];
    return (assignments || [])
      .filter((assignment: any) => {
        if (!assignment?.student_id) return false;
        if (isTutor && assignment.student_role && assignment.student_role !== 'ALTERNANT') return false;
        return true;
      })
      .map((assignment: any) => ({
        id: assignment.student_id.toString(),
        firstName: assignment.student_firstname,
        lastName: assignment.student_lastname,
        role: assignment.student_role,
      }));
  }, [assignments, isTutor, isMaitre]);

  const studentOptions = useMemo(() => {
    if (isTutor || isMaitre) return assignedStudents;
    const source = isAdmin ? users : members;
    return (source || []).filter((u: any) => ['ALTERNANT', 'ETUDIANT_CLASSIQUE'].includes(u.role));
  }, [isAdmin, users, members, isTutor, isMaitre, assignedStudents]);

  const journalOptions = useMemo(() => {
    if (!(isTutor || isMaitre) || !studentId) return [];
    return (classJournals || [])
      .filter((journal: any) => journal.userId?.toString() === studentId)
      .map((journal: any) => ({
        id: journal.id?.toString(),
        label:
          journal.periodStart && journal.periodEnd
            ? `Journal ${journal.periodStart.slice(0, 10)} - ${journal.periodEnd.slice(0, 10)}`
            : `Journal #${journal.id}`,
      }));
  }, [classJournals, studentId, isTutor, isMaitre]);

  const requirementOptions = useMemo(() => {
    if (!(isTutor || isMaitre) || !studentId) return [];
    return (classRequirements || [])
      .map((req: any) => {
        const submission = (req.submissions || []).find(
          (sub: any) => sub.userId?.toString() === studentId
        );
        if (!submission) return null;
        const label = req.title ? `${req.title} (${submission.fileName || 'soumission'})` : `Rapport #${req.id}`;
        return { id: req.id?.toString(), label };
      })
      .filter((item: any) => item);
  }, [classRequirements, isTutor, isMaitre, studentId]);

  React.useEffect(() => {
    if ((isTutor || isMaitre) && assignedStudents.length === 1) {
      setStudentId(assignedStudents[0].id);
    }
  }, [assignedStudents, isTutor, isMaitre]);

  React.useEffect(() => {
    if (!(isTutor || isMaitre)) return;
    const options =
      contextType === 'JOURNAL' ? journalOptions : contextType === 'REQUIREMENT' ? requirementOptions : [];
    const contextParam = searchParams.get('contextId');
    if (options.length === 0) {
      if (!contextParam && contextId !== '') setContextId('');
      return;
    }
    const exists = options.some((opt) => opt.id === contextId);
    if (!exists) {
      if (options.length === 1) {
        setContextId(options[0].id);
      } else if (contextId !== '') {
        setContextId('');
      }
    }
  }, [contextType, journalOptions, requirementOptions, isTutor, isMaitre, contextId, searchParams]);

  const selectedSoutenance = useMemo(() => {
    return mySoutenances.find((s: any) => s.id?.toString() === selectedSoutenanceId) || null;
  }, [mySoutenances, selectedSoutenanceId]);

  const { data: selectedGrid } = useQuery({
    queryKey: ['evaluation-grid', gridId],
    queryFn: () => evaluationGridService.getGrid(gridId),
    enabled: !!gridId,
  });

  const { data: myEvaluations = [] } = useQuery({
    queryKey: ['evaluations', 'mine'],
    queryFn: () => evaluationService.getStudentEvaluations(user?.id || ''),
    enabled: isStudent && !!user?.id,
  });

  const { data: detailScores = [] } = useQuery({
    queryKey: ['evaluation-scores', selectedEvaluation?.id],
    queryFn: () => evaluationService.getEvaluationScores(selectedEvaluation.id.toString()),
    enabled: !!selectedEvaluation?.id && showDetailModal,
  });

  const { data: detailGrid } = useQuery({
    queryKey: ['evaluation-grid-detail', selectedEvaluation?.gridId],
    queryFn: () => evaluationGridService.getGrid(selectedEvaluation.gridId),
    enabled: !!selectedEvaluation?.gridId && showDetailModal,
  });

  const queryClient = useQueryClient();
  const { data: adminEvaluations = [] } = useQuery({
    queryKey: ['evaluations', 'admin', 'pending'],
    queryFn: () => evaluationService.getAdminEvaluations('PENDING'),
    enabled: isAdmin,
  });
  const { mutate: validateEvaluationGroup, isPending: validating } = useMutation({
    mutationFn: (payload: { studentId: string; contextType: 'JOURNAL' | 'REQUIREMENT' | 'SOUTENANCE'; contextId: string; status: 'VALIDATED' | 'REJECTED' }) =>
      evaluationService.validateEvaluationGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations', 'admin', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['evaluations', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    },
  });

  const studentRows = useMemo(() => {
    if (!isStudent) return [];
    const requirementGroups = new Map<string, { contextId: string; contextLabel?: string; evaluations: any[] }>();
    const otherRows: any[] = [];

    (myEvaluations || []).forEach((ev: any) => {
      if (ev.contextType !== 'REQUIREMENT') {
        otherRows.push(ev);
        return;
      }
      const key = `${ev.contextType}-${ev.contextId}`;
      const group = requirementGroups.get(key) || { contextId: ev.contextId, contextLabel: ev.contextLabel, evaluations: [] };
      group.evaluations.push(ev);
      if (!group.contextLabel && ev.contextLabel) {
        group.contextLabel = ev.contextLabel;
      }
      requirementGroups.set(key, group);
    });

    const requirementRows: any[] = [];
    requirementGroups.forEach((group) => {
      const validated = group.evaluations.filter((ev) => ev.status === 'VALIDATED');
      const tutor = validated.find((ev) => ev.evaluatorRole === 'TUTEUR_ECOLE');
      const maitre = validated.find((ev) => ev.evaluatorRole === 'MAITRE_APP');
      if (tutor && maitre && tutor.overallScore !== undefined && maitre.overallScore !== undefined) {
        const average = Number(((Number(tutor.overallScore) + Number(maitre.overallScore)) / 2).toFixed(2));
        requirementRows.push({
          id: `AVG-${group.contextId}`,
          contextType: 'REQUIREMENT',
          contextId: group.contextId,
          contextLabel: group.contextLabel || `Rapport #${group.contextId}`,
          overallScore: average,
          status: 'VALIDATED',
          comment: 'Moyenne tuteur/maitre',
          isAggregate: true,
        });
      }
    });

    return [...otherRows, ...requirementRows];
  }, [myEvaluations, isStudent]);

  const columns = isStudent
    ? [
        {
          header: 'Contexte',
          accessor: (row: any) => row.contextLabel || `${row.contextType} #${row.contextId}`,
        },
        { header: 'Note', accessor: (row: any) => row.overallScore ?? '-' },
        { header: 'Statut', accessor: (row: any) => row.status || '-' },
        { header: 'Commentaire', accessor: (row: any) => row.comment || '-' },
        {
          header: 'DActails',
          accessor: (row: any) =>
            row.isAggregate ? (
              <span className="text-sm text-gray-500">-</span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedEvaluation(row);
                  setShowDetailModal(true);
                }}
              >
                Voir
              </Button>
            ),
        },
      ]
    : [
        { header: 'Contexte', accessor: (row: any) => row.contextLabel || `${row.contextType} #${row.contextId}` },
        { header: 'Note', accessor: (row: any) => row.overallScore ?? '-' },
        { header: 'Commentaire', accessor: (row: any) => row.comment || '-' },
      ];

  const evaluatorRoleLabels: Record<string, string> = {
    TUTEUR_ECOLE: 'Tuteur',
    MAITRE_APP: 'Maitre d\'apprentissage',
    JURY: 'Jury',
    INTERVENANT: 'Intervenant',
    ADMIN: 'Admin',
  };

  const pendingGroups = useMemo(() => {
    const groups = new Map<string, any>();
    (adminEvaluations || []).forEach((ev: any) => {
      const key = `${ev.studentId}-${ev.contextType}-${ev.contextId}`;
      const existing = groups.get(key) || {
        key,
        studentId: ev.studentId?.toString(),
        studentName: ev.student_firstname || ev.student_lastname
          ? `${ev.student_firstname || ''} ${ev.student_lastname || ''}`.trim()
          : `Etudiant #${ev.studentId}`,
        contextType: ev.contextType,
        contextId: ev.contextId?.toString(),
        contextLabel: ev.context_label || ev.contextLabel || `${ev.contextType} #${ev.contextId}`,
        evaluations: [],
      };
      existing.evaluations.push(ev);
      groups.set(key, existing);
    });

    return Array.from(groups.values()).map((group) => {
      const tutor = group.evaluations.find((ev: any) => ev.evaluator_role === 'TUTEUR_ECOLE');
      const maitre = group.evaluations.find((ev: any) => ev.evaluator_role === 'MAITRE_APP');
      const scores = [tutor?.overallScore, maitre?.overallScore]
        .map((score: any) => (score !== null && score !== undefined ? Number(score) : null))
        .filter((score: any) => !Number.isNaN(score) && score !== null);
      const average = scores.length === 2 ? Number(((scores[0] + scores[1]) / 2).toFixed(2)) : null;
      return {
        ...group,
        hasTutor: !!tutor,
        hasMaitre: !!maitre,
        average,
      };
    });
  }, [adminEvaluations]);

  const resetGridForm = () => {
    setEditingGrid(null);
    setGridName('');
    setGridDescription('');
    setCriteria([{ label: '', maxScore: 20, weight: 1 }]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Évaluations</h1>
        <p className="text-gray-600">Saisie et consultation des évaluations</p>
      </div>

      {isStudent && (
        <Card>
          <Table data={studentRows || []} columns={columns} emptyMessage="Aucune évaluation" />
        </Card>
      )}

      {canManageGrids && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Grilles d&apos;évaluation</h2>
            <Button
              onClick={() => {
                resetGridForm();
                setShowGridModal(true);
              }}
            >
              Nouvelle grille
            </Button>
          </div>
          {grids.length === 0 ? (
            <p className="text-sm text-gray-600">Aucune grille disponible.</p>
          ) : (
            <div className="space-y-3">
              {grids.map((grid: any) => (
                <div key={grid.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium text-gray-900">{grid.name}</p>
                    {grid.description && <p className="text-sm text-gray-600">{grid.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const fullGrid = await evaluationGridService.getGrid(grid.id.toString());
                        setEditingGrid(fullGrid);
                        setGridName(fullGrid.name || '');
                        setGridDescription(fullGrid.description || '');
                        setCriteria(
                          fullGrid.criteria?.map((c: any) => ({
                            label: c.label,
                            maxScore: c.maxScore,
                            weight: c.weight,
                          })) || []
                        );
                        setShowGridModal(true);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button size="sm" variant="outline" isLoading={deletingGrid} onClick={() => deleteGrid(grid.id.toString())}>
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {isAdmin && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Validations en attente</h2>
            <span className="text-sm text-gray-600">{pendingGroups.length} validation(s)</span>
          </div>
          {pendingGroups.length === 0 ? (
            <p className="text-sm text-gray-600">Aucune evaluation en attente.</p>
          ) : (
            <div className="space-y-4">
              {pendingGroups.map((group: any) => (
                <div key={group.key} className="rounded-md border p-3 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{group.studentName}</p>
                      <p className="text-sm text-gray-600">Document: {group.contextLabel}</p>
                      <p className="text-sm text-gray-600">Moyenne proposee: {group.average ?? '-'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          validating ||
                          (group.contextType === 'REQUIREMENT' && (!group.hasTutor || !group.hasMaitre))
                        }
                        onClick={() =>
                          validateEvaluationGroup({
                            studentId: group.studentId,
                            contextType: group.contextType,
                            contextId: group.contextId,
                            status: 'VALIDATED',
                          })
                        }
                      >
                        Valider
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={validating}
                        onClick={() =>
                          validateEvaluationGroup({
                            studentId: group.studentId,
                            contextType: group.contextType,
                            contextId: group.contextId,
                            status: 'REJECTED',
                          })
                        }
                      >
                        Rejeter
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {group.evaluations.map((ev: any) => (
                      <div key={ev.id} className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {evaluatorRoleLabels[ev.evaluator_role] || ev.evaluator_role || 'Evaluateur'}
                          {ev.evaluator_firstname || ev.evaluator_lastname
                            ? ` - ${(ev.evaluator_firstname || '')} ${(ev.evaluator_lastname || '')}`.trim()
                            : ''}
                        </span>
                        <span>{ev.overallScore ?? '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {canCreate && !isAdmin && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle évaluation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isJuryOrIntervenant && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Soutenance</label>
                <select
                  value={selectedSoutenanceId}
                  onChange={(e) => setSelectedSoutenanceId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selectionner</option>
                  {mySoutenances.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.studentFirstName && s.studentLastName
                        ? `${s.studentFirstName} ${s.studentLastName}`
                        : `Etudiant #${s.studentId}`} - {s.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {!isAdmin && !isJuryOrIntervenant && (
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
              {isJuryOrIntervenant ? (
                <input
                  type="text"
                  value={
                    selectedSoutenance?.studentFirstName && selectedSoutenance?.studentLastName
                      ? `${selectedSoutenance.studentFirstName} ${selectedSoutenance.studentLastName}`
                      : studentId
                  }
                  readOnly
                  className="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  placeholder="Selectionnez une soutenance"
                />
              ) : studentOptions.length ? (
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Sélectionner</option>
                  {studentOptions.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="ID étudiant"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contexte</label>
              <select
                value={contextType}
                onChange={(e) => setContextType(e.target.value as any)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {(isTutor || isMaitre) && <option value="JOURNAL">Journal</option>}
                <option value="REQUIREMENT">Rapport de projet</option>
                {isJuryOrIntervenant && <option value="SOUTENANCE">Soutenance</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {contextType === 'REQUIREMENT' ? 'Rapport de projet' : 'Contexte'}
              </label>
              {isTutor || isMaitre ? (
                <select
                  value={contextId}
                  onChange={(e) => setContextId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selectionner</option>
                  {(contextType === 'JOURNAL' ? journalOptions : requirementOptions).map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={contextId}
                  onChange={(e) => setContextId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={contextType === 'SOUTENANCE' && isJuryOrIntervenant ? 'Auto' : ''}
                  readOnly={contextType === 'SOUTENANCE' && isJuryOrIntervenant}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grille</label>
              <select
                value={gridId}
                onChange={(e) => {
                  setGridId(e.target.value);
                  setScores({});
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionner</option>
                {grids.map((g: any) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedGrid?.criteria?.length ? (
            <div className="mt-4 space-y-3">
              {selectedGrid.criteria.map((c: any) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{c.label}</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={c.maxScore}
                    value={scores[c.id] ?? ''}
                    onChange={(e) => setScores((prev) => ({ ...prev, [c.id]: Number(e.target.value) }))}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500">/ {c.maxScore}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              isLoading={creating}
              onClick={() => {
                if (isJuryOrIntervenant && contextType === 'SOUTENANCE' && !selectedSoutenanceId) {
                  return;
                }
                if (!studentId || !contextId) {
                  return;
                }
                const payload = {
                  studentId,
                  contextType,
                  contextId,
                  gridId: gridId || undefined,
                  comment,
                  scores: Object.entries(scores).map(([criteriaId, score]) => ({
                    criteriaId: Number(criteriaId),
                    score,
                  })),
                };
                createEvaluation(payload);
                setStudentId('');
                setContextId('');
                setGridId('');
                setScores({});
                setComment('');
                setSelectedSoutenanceId('');
              }}
            >
              Enregistrer
            </Button>
          </div>
        </Card>
      )}

      <Modal
        isOpen={showGridModal}
        onClose={() => {
          setShowGridModal(false);
          resetGridForm();
        }}
        title={editingGrid ? 'Modifier la grille' : 'Créer une grille'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={gridName}
              onChange={(e) => setGridName(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={gridDescription}
              onChange={(e) => setGridDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {editingGrid ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Critères existants (non modifiables) :</p>
              {criteria.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun critère.</p>
              ) : (
                criteria.map((c, index) => (
                  <div key={`${c.label}-${index}`} className="flex items-center justify-between rounded-md border p-2">
                    <span className="text-sm text-gray-700">{c.label}</span>
                    <span className="text-xs text-gray-500">
                      / {c.maxScore} (poids {c.weight})
                    </span>
                  </div>
                ))
              )}
              <p className="text-xs text-gray-500">Pour modifier les critères, créez une nouvelle grille.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Critères</p>
              {criteria.map((c, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <input
                    type="text"
                    value={c.label}
                    onChange={(e) => {
                      const next = [...criteria];
                      next[index] = { ...next[index], label: e.target.value };
                      setCriteria(next);
                    }}
                    className="md:col-span-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Libellé"
                  />
                  <input
                    type="number"
                    value={c.maxScore}
                    min={1}
                    onChange={(e) => {
                      const next = [...criteria];
                      next[index] = { ...next[index], maxScore: Number(e.target.value) || 1 };
                      setCriteria(next);
                    }}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Max"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={c.weight}
                      min={1}
                      onChange={(e) => {
                        const next = [...criteria];
                        next[index] = { ...next[index], weight: Number(e.target.value) || 1 };
                        setCriteria(next);
                      }}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Poids"
                    />
                    <Button size="sm" variant="outline" onClick={() => setCriteria(criteria.filter((_, i) => i !== index))}>
                      Retirer
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCriteria([...criteria, { label: '', maxScore: 20, weight: 1 }])}
              >
                Ajouter un critère
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowGridModal(false)}>
              Annuler
            </Button>
            <Button
              isLoading={creatingGrid || updatingGrid}
              onClick={() => {
                if (!gridName.trim()) return;
                if (editingGrid) {
                  updateGrid({ id: editingGrid.id.toString(), payload: { name: gridName.trim(), description: gridDescription.trim() } });
                } else {
                  createGrid({
                    name: gridName.trim(),
                    description: gridDescription.trim() || undefined,
                    criteria: criteria
                      .filter((c) => c.label.trim())
                      .map((c) => ({ label: c.label.trim(), maxScore: c.maxScore, weight: c.weight })),
                  });
                }
                setShowGridModal(false);
                resetGridForm();
              }}
            >
              {editingGrid ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détail de l'évaluation"
        size="md"
      >
        {selectedEvaluation ? (
          <div className="space-y-4">
            <div className="rounded-md border p-3">
              <p className="text-sm text-gray-600">Contexte</p>
              <p className="font-medium text-gray-900">
                {selectedEvaluation.contextType} #{selectedEvaluation.contextId}
              </p>
              <p className="text-sm text-gray-600 mt-2">Note globale</p>
              <p className="font-medium text-gray-900">{selectedEvaluation.overallScore ?? '-'}</p>
              {selectedEvaluation.comment && (
                <>
                  <p className="text-sm text-gray-600 mt-2">Commentaire</p>
                  <p className="text-gray-900">{selectedEvaluation.comment}</p>
                </>
              )}
            </div>

            {detailGrid?.criteria?.length ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Détails des critères</p>
                {detailGrid.criteria.map((criterion: any) => {
                  const score = detailScores.find((s: any) => s.criteriaId?.toString() === criterion.id.toString());
                  return (
                    <div key={criterion.id} className="flex items-center justify-between border rounded-md p-2">
                      <div>
                        <p className="text-sm text-gray-700">{criterion.label}</p>
                        <p className="text-xs text-gray-500">Poids: {criterion.weight}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {score?.score ?? '-'} / {criterion.maxScore}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Aucun détail de grille disponible.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Aucune évaluation sélectionnée.</p>
        )}
      </Modal>
    </div>
  );
};
