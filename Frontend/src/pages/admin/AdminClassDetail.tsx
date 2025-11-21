import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { classService, userService } from '../../services/api.service';
import { User } from '../../types/api';
import toast from 'react-hot-toast';

const AdminClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const { data: classData, isLoading: loadingClass } = useQuery({
    queryKey: ['classes', id],
    queryFn: () => classService.getClass(id!),
    enabled: !!id,
  });

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ['classes', id, 'members'],
    queryFn: () => classService.getClassMembers(id!),
    enabled: !!id,
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: userService.getAllUsers,
  });

  const addMemberMutation = useMutation({
    mutationFn: () => classService.addClassMember(id!, selectedUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', id, 'members'] });
      setSelectedUserId('');
      toast.success('Membre ajouté');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de l’ajout';
      toast.error(message);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => classService.removeClassMember(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', id, 'members'] });
      toast.success('Membre retiré');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors du retrait';
      toast.error(message);
    },
  });

  const availableUsers = useMemo(() => {
    if (!users || !members) return [];
    const memberIds = new Set(members.map((m: any) => m.id?.toString()));
    return users.filter((u: User) => u.role?.toString()?.startsWith('ALTERNANT') || u.role === 'ETUDIANT_CLASSIQUE')
      .filter((u: User) => !memberIds.has(u.id.toString()));
  }, [users, members]);

  if (!id) {
    return (
      <Card>
        <p>ID de classe manquant</p>
      </Card>
    );
  }

  if (loadingClass) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{classData?.name || 'Classe'}</h1>
          <p className="text-gray-600">{classData?.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
          <Link to="/admin/classes">
            <Button variant="secondary">Liste des classes</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Année</p>
            <p className="text-lg font-semibold text-gray-900">{(classData as any)?.year || '—'}</p>
          </div>
          <div>
            <p className="text-gray-600">Niveau</p>
            <p className="text-lg font-semibold text-gray-900">{(classData as any)?.level || '—'}</p>
          </div>
          <div>
            <p className="text-gray-600">Tuteur</p>
            <p className="text-lg font-semibold text-gray-900">
              {(classData as any)?.tuteur?.firstname ? `${(classData as any).tuteur.firstname} ${(classData as any).tuteur.lastname}` : '—'}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Membres de la classe</h2>
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loadingUsers || loadingMembers}
            >
              <option value="">Ajouter un étudiant...</option>
              {availableUsers.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} - {u.email}
                </option>
              ))}
            </select>
            <Button
              onClick={() => selectedUserId && addMemberMutation.mutate()}
              disabled={!selectedUserId || addMemberMutation.isPending}
            >
              Ajouter
            </Button>
          </div>
        </div>

        {loadingMembers ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y">
            {(members || []).map((m: any) => (
              <div key={m.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {m.firstName || m.firstname} {m.lastName || m.lastname}
                  </p>
                  <p className="text-sm text-gray-600">{m.email}</p>
                  <p className="text-xs text-gray-500">{m.role}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeMemberMutation.mutate(m.id.toString())}
                  disabled={removeMemberMutation.isPending}
                >
                  Retirer
                </Button>
              </div>
            ))}
            {(members || []).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Aucun membre pour le moment.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminClassDetail;
