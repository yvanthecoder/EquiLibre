import React, { useEffect, useMemo, useState } from 'react';
import { useUsers, useDeleteUser, useUpdateUser, useCreateUser, useClassesList } from '../../hooks/useUsers';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Table } from '../../components/UI/Table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Modal } from '../../components/UI/Modal';
import { RegisterRequest, UpdateUserRequest, User, UserRole } from '../../types/api';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  classId?: string;
  isActive: boolean;
};

const roleLabels: Record<UserRole, string> = {
  ALTERNANT: 'Alternant',
  ETUDIANT_CLASSIQUE: 'Etudiant',
  TUTEUR_ECOLE: 'Tuteur',
  MAITRE_APP: "Maître d'app.",
  ADMIN: 'Admin',
};

const defaultForm: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'ALTERNANT',
  password: '',
  phone: '',
  company: '',
  jobTitle: '',
  classId: '',
  isActive: true,
};

export const AdminUsers: React.FC = () => {
  const { users, isLoading } = useUsers();
  const { deleteUser, isDeleting } = useDeleteUser();
  const { createUser, isCreating } = useCreateUser();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { updateUser, isUpdating } = useUpdateUser(editingUser?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const { classes } = useClassesList();

  const classLabel = useMemo(() => {
    const map: Record<string, string> = {};
    (classes || []).forEach((cls: any) => {
      if (cls?.id) map[cls.id] = cls.name;
    });
    return map;
  }, [classes]);

  useEffect(() => {
    if (editingUser) {
      setForm({
        firstName: editingUser.firstName || '',
        lastName: editingUser.lastName || '',
        email: editingUser.email || '',
        role: editingUser.role || 'ALTERNANT',
        phone: editingUser.phone || '',
        company: editingUser.company || '',
        jobTitle: editingUser.jobTitle || '',
        classId: editingUser.classId || '',
        password: '',
        isActive: (editingUser as any).isActive !== false,
      });
    } else {
      setForm(defaultForm);
    }
  }, [editingUser]);

  const handleDelete = (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser(userId);
    }
  };

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      alert('Prénom, nom et email sont requis');
      return;
    }

    if (!editingUser && !form.password) {
      alert('Le mot de passe est requis pour créer un utilisateur');
      return;
    }

    if (editingUser) {
      const payload: UpdateUserRequest = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        role: form.role,
        phone: form.phone,
        company: form.company,
        jobTitle: form.jobTitle,
        classId: form.classId || undefined,
        isActive: form.isActive,
        password: form.password || undefined,
      };
      updateUser(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingUser(null);
        },
      });
    } else {
      const payload: RegisterRequest = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phone: form.phone,
        company: form.company,
        jobTitle: form.jobTitle,
        classId: form.classId || undefined,
      };
      createUser(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          setForm(defaultForm);
        },
      });
    }
  };

  const columns = [
    {
      header: 'Nom',
      accessor: (row: any) => `${row.firstName} ${row.lastName}`,
    },
    {
      header: 'Email',
      accessor: 'email' as const,
    },
    {
      header: 'Rôle',
      accessor: (row: any) => (
        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
          {roleLabels[row.role as UserRole]}
        </span>
      ),
    },
    {
      header: 'Classe',
      accessor: (row: any) => classLabel[row.classId] || '—',
    },
    {
      header: 'Créé le',
      accessor: (row: any) =>
        row.createdAt ? format(new Date(row.createdAt), 'dd/MM/yyyy', { locale: fr }) : '—',
    },
    {
      header: 'Statut',
      accessor: (row: any) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            row.isActive === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {row.isActive === false ? 'Inactif' : 'Actif'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingUser(row);
              setIsModalOpen(true);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row.id)}
            disabled={isDeleting}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <Button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table data={users || []} columns={columns} emptyMessage="Aucun utilisateur trouvé" />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Modifier un utilisateur' : 'Créer un utilisateur'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                type="text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe {editingUser && '(laisser vide pour ne pas changer)'}
              </label>
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                type="password"
                placeholder={editingUser ? 'Nouveau mot de passe' : 'Mot de passe'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                type="text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                type="text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
              <input
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({ ...form, role })}
                    className={`px-3 py-2 rounded border text-sm ${
                      form.role === role ? 'bg-blue-100 border-blue-300 text-blue-800' : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {roleLabels[role]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Aucune</option>
                {(classes || []).map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 mt-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Compte actif
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingUser(null);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSubmit} isLoading={isCreating || isUpdating}>
              {editingUser ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
