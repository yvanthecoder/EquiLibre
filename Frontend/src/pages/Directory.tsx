import React, { useMemo, useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';

const roleLabels: Record<string, string> = {
  ALTERNANT: 'Alternant',
  ETUDIANT_CLASSIQUE: 'Étudiant',
  TUTEUR_ECOLE: 'Tuteur',
  MAITRE_APP: "Maître d'apprentissage",
  ADMIN: 'Admin',
};

export const Directory: React.FC = () => {
  const { users, isLoading } = useUsers();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return (users || []).filter((u: any) => {
      const matchTerm =
        !term ||
        u.firstName?.toLowerCase().includes(term) ||
        u.lastName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term);
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchTerm && matchRole;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Annuaire</h1>
          <p className="text-gray-600">Trouvez camarades, tuteurs, maîtres d’apprentissage</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (nom, email)"
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
          >
            <option value="ALL">Tous les rôles</option>
            {Object.keys(roleLabels).map((r) => (
              <option key={r} value={r}>
                {roleLabels[r]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((u: any) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{u.email}</p>
                  <p className="text-xs text-gray-500">{roleLabels[u.role] || u.role}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/messages')}>
                  Contacter
                </Button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Aucun résultat</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Directory;
