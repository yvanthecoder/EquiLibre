import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { UserIcon, EnvelopeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    const roles = {
      ALTERNANT: 'Alternant',
      ETUDIANT: 'Étudiant',
      TUTEUR: 'Tuteur',
      MAITRE_APP: 'Maître d\'apprentissage',
      RESP_PLATEFORME: 'Responsable plateforme',
    };
    return roles[role as keyof typeof roles] || role;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600">
          Gérez vos informations personnelles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center space-x-6 mb-6">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600">{getRoleLabel(user.role)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{user.firstName}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{user.lastName}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle
                  </label>
                  <div className="flex items-center space-x-2">
                    <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{getRoleLabel(user.role)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membre depuis
                </label>
                <p className="text-gray-900">
                  {user.createdAt
                    ? format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: fr })
                    : 'Date non disponible'
                  }
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button variant="primary">
                Modifier le profil
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistiques
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Exigences soumises</span>
                <span className="font-semibold text-blue-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Validations obtenues</span>
                <span className="font-semibold text-green-600">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Messages envoyés</span>
                <span className="font-semibold text-purple-600">12</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Paramètres
            </h3>
            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Changer le mot de passe
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Notifications
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Préférences
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};