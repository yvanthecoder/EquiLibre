import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/UI/Card';
import { assignmentService } from '../../services/api.service';
import { format } from 'date-fns';

const AdminLogs: React.FC = () => {
  const { data: assignmentLogs, isLoading: loadingA } = useQuery({
    queryKey: ['logs', 'assignments'],
    queryFn: () => assignmentService.getAssignmentHistory(),
  });

  const { data: signatureLogs, isLoading: loadingS } = useQuery({
    queryKey: ['logs', 'signatures'],
    queryFn: async () => {
      // pas d'endpoint global, on laisse vide pour l'instant
      return [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Logs et Traçabilité</h1>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Historique des assignations</h3>
        {loadingA ? (
          <p>Chargement...</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto text-sm">
            {(assignmentLogs || []).map((log: any, idx: number) => (
              <div key={idx} className="flex justify-between border-b border-gray-100 pb-1">
                <div>
                  <p className="text-gray-900">
                    {log.action} - Étudiant #{log.student_id} | Maitre {log.old_maitre_id || '—'} → {log.new_maitre_id || '—'} |
                    Tuteur {log.old_tuteur_id || '—'} → {log.new_tuteur_id || '—'}
                  </p>
                  <p className="text-xs text-gray-500">Par user #{log.changed_by || '—'}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {log.created_at ? format(new Date(log.created_at), 'dd/MM HH:mm') : ''}
                </span>
              </div>
            ))}
            {(assignmentLogs || []).length === 0 && <p className="text-gray-500">Aucun log</p>}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Signatures de documents</h3>
        {loadingS ? (
          <p>Chargement...</p>
        ) : (
          <p className="text-sm text-gray-500">Collecte des signatures centralisée à implémenter.</p>
        )}
      </Card>
    </div>
  );
};

export default AdminLogs;
