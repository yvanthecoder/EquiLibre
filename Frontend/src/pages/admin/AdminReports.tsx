import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/UI/Card';
import { assignmentService, classService } from '../../services/api.service';
import { Button } from '../../components/UI/Button';
import { useNavigate } from 'react-router-dom';

const AdminReports: React.FC = () => {
  const { data: classes } = useQuery({
    queryKey: ['reports', 'classes'],
    queryFn: classService.getMyClasses,
  });
  const navigate = useNavigate();

  const { data: assignments } = useQuery({
    queryKey: ['reports', 'assignments'],
    queryFn: () => assignmentService.getAllAssignments(),
  });

  const byClass = useMemo(() => {
    const grouped: Record<string, number> = {};
    (assignments || []).forEach((a: any) => {
      const cid = a.class_id?.toString() || 'inconnu';
      grouped[cid] = (grouped[cid] || 0) + 1;
    });
    return grouped;
  }, [assignments]);

  const exportCsv = () => {
    const rows = [['Classe', 'Assignations']];
    (classes || []).forEach((cls: any) => {
      rows.push([cls.name || cls.id, (byClass[cls.id] || 0).toString()]);
    });
    const csv = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rapport-assignations.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>← Retour</Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reporting</h1>
            <p className="text-gray-600">Stats rapides par classe (assignations)</p>
          </div>
        </div>
        <Button onClick={exportCsv}>Exporter CSV</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(classes || []).map((cls: any) => (
          <Card key={cls.id}>
            <h3 className="font-semibold text-gray-900">{cls.name}</h3>
            <p className="text-sm text-gray-600">Assignations : {byClass[cls.id] || 0}</p>
          </Card>
        ))}
        {(classes || []).length === 0 && (
          <Card>
            <p className="text-gray-600">Aucune classe</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
