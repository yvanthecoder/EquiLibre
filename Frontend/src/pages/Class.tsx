import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { classService } from '../services/api.service';
import { useNavigate } from 'react-router-dom';

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export const ClassPage: React.FC = () => {
  const { user } = useAuth();
  const { users } = useUsers();
  const [members, setMembers] = useState<Member[]>([]);
  const [className, setClassName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!user?.classId) return;
      try {
        const cls = await classService.getClass(user.classId);
        setClassName(cls.name);
        const mems = await classService.getClassMembers(user.classId);
        setMembers(mems as any);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [user?.classId]);

  const { profs, classmates } = useMemo(() => {
    const profRoles = new Set(['MAITRE_APP', 'TUTEUR_ECOLE', 'ADMIN']);
    const profList: Member[] = [];
    const students: Member[] = [];
    (members || []).forEach((m: any) => {
      if (profRoles.has(m.role)) {
        profList.push(m);
      } else {
        students.push(m);
      }
    });
    return { profs: profList, classmates: students.filter((s) => s.id !== user?.id) };
  }, [members, user?.id]);

  if (!user?.classId) {
    return (
      <Card>
        <p className="text-gray-600">Aucune classe associée.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>← Retour</Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ma classe</h1>
            <p className="text-gray-600">{className || `Classe #${user.classId}`}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipe tutorale</h2>
          <div className="space-y-3">
            {profs.length === 0 && <p className="text-sm text-gray-500">Aucun tuteur/maître.</p>}
            {profs.map((p) => (
              <div key={p.id} className="p-3 bg-gray-50 rounded-md border flex justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{p.email}</p>
                  <p className="text-xs text-gray-500">{p.role}</p>
                </div>
                <Button size="sm" variant="outline">
                  Contacter
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Camarades de classe</h2>
          <div className="space-y-3">
            {classmates.length === 0 && <p className="text-sm text-gray-500">Aucun camarade.</p>}
            {classmates.map((c) => (
              <div key={c.id} className="p-3 bg-gray-50 rounded-md border flex justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{c.email}</p>
                </div>
                <Button size="sm" variant="outline">
                  Contacter
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClassPage;
