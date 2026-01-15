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
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Table } from '../components/UI/Table';
import { Modal } from '../components/UI/Modal';
import { useQuery } from '@tanstack/react-query';
import { evaluationService, evaluationGridService } from '../services/api.service';

type CriteriaDraft = { label: string; maxScore: number; weight: number };

export const Evaluations: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'ALTERNANT' || user?.role === 'ETUDIANT_CLASSIQUE';
  const isAdmin = user?.role === 'ADMIN';
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
  const [contextType, setContextType] = useState<'JOURNAL' | 'REQUIREMENT' | 'SOUTENANCE'>('JOURNAL');
  const [contextId, setContextId] = useState('');
  const [gridId, setGridId] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');

  const [showGridModal, setShowGridModal] = useState(false);
  const [editingGrid, setEditingGrid] = useState<any | null>(null);
  const [gridName, setGridName] = useState('');
  const [gridDescription, setGridDescription] = useState('');
  const [criteria, setCriteria] = useState<CriteriaDraft[]>([{ label: '', maxScore: 20, weight: 1 }]);

  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const canCreate = ['ADMIN', 'TUTEUR_ECOLE', 'MAITRE_APP', 'JURY', 'INTERVENANT'].includes(user?.role || '');

  React.useEffect(() => {
    if (!isAdmin && canCreate && !selectedClassId && classes.length) {
      setSelectedClassId(classes[0].id);
    }
  }, [isAdmin, canCreate, selectedClassId, classes]);

  const studentOptions = useMemo(() => {
    const source = isAdmin ? users : members;
    return (source || []).filter((u: any) => ['ALTERNANT', 'ETUDIANT_CLASSIQUE'].includes(u.role));
  }, [isAdmin, users, members]);

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

  const columns = [
    { header: 'Contexte', accessor: (row: any) => `${row.contextType} #${row.contextId}` },
    { header: 'Note', accessor: (row: any) => row.overallScore ?? '-' },
    { header: 'Commentaire', accessor: (row: any) => row.comment || '-' },
    ...(isStudent
      ? [
          {
            header: 'Détails',
            accessor: (row: any) => (
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
      : []),
  ];

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
          <Table data={myEvaluations || []} columns={columns} emptyMessage="Aucune évaluation" />
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

      {canCreate && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle évaluation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isAdmin && (
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
              {studentOptions.length ? (
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
                <option value="JOURNAL">Journal</option>
                <option value="REQUIREMENT">Livrable</option>
                <option value="SOUTENANCE">Soutenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID du contexte</label>
              <input
                type="number"
                value={contextId}
                onChange={(e) => setContextId(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
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
