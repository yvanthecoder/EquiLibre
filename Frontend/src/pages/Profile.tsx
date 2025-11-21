import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { UserIcon, EnvelopeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EditProfileModal from '../components/Profile/EditProfileModal';
import ChangePasswordModal from '../components/Profile/ChangePasswordModal';
import { classService } from '../services/api.service';
import toast from 'react-hot-toast';
import { Modal } from '../components/UI/Modal';
import { useNotifications } from '../hooks/useNotifications';
import { useRequirements } from '../hooks/useRequirements';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { requirements } = useRequirements(user?.classId);
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [className, setClassName] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pref_darkmode');
    return saved === 'true';
  });
  const [emailNotif, setEmailNotif] = useState(true);
  const { notifications } = useNotifications();

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

  useEffect(() => {
    const loadClass = async () => {
      if (!user.classId) return;
      try {
        const cls = await classService.getClass(user.classId);
        setClassName(cls.name);
      } catch {
        setClassName(null);
      }
    };
    loadClass();
  }, [user.classId]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('pref_darkmode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const shouldOpen = localStorage.getItem('open_notifications');
    if (shouldOpen === 'true') {
      setShowNotifications(true);
      localStorage.removeItem('open_notifications');
    }
  }, []);

  const submissionsByMe = (() => {
    if (!requirements || !user) return 0;
    return requirements.reduce((acc, req: any) => {
      const mine = req.submissions?.filter((s: any) => s.userId?.toString() === user.id.toString()).length || 0;
      return acc + mine;
    }, 0);
  })();

  const validationsByMe = (() => {
    if (!requirements || !user) return 0;
    return requirements.reduce((acc, req: any) => {
      const mine = req.submissions?.filter(
        (s: any) => s.userId?.toString() === user.id.toString() && s.status === 'VALIDATED'
      ).length || 0;
      return acc + mine;
    }, 0);
  })();

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <span className="text-gray-900">{user.phone || 'Non renseigné'}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Société
                  </label>
                  <span className="text-gray-900">{user.company || 'Non renseignée'}</span>
                </div>

                {user.classId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Classe
                    </label>
                    <span className="text-gray-900">{className || `Classe #${user.classId}`}</span>
                  </div>
                )}
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

            <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
              <Button variant="primary" onClick={() => setShowEdit(true)}>
                Modifier le profil
              </Button>
              <Button variant="outline" onClick={() => setShowPassword(true)}>
                Changer le mot de passe
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
                <span className="font-semibold text-blue-600">{submissionsByMe}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Validations obtenues</span>
                <span className="font-semibold text-green-600">{validationsByMe}</span>
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
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowPassword(true)}>
                Changer le mot de passe
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowNotifications(true)}
              >
                Notifications
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowPrefs(true)}
              >
                Préférences
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <EditProfileModal isOpen={showEdit} onClose={() => setShowEdit(false)} />
      <ChangePasswordModal isOpen={showPassword} onClose={() => setShowPassword(false)} />

      {/* Notifications Modal */}
      <Modal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="Mes notifications"
        size="md"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <Card key={n.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">{n.title}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(n.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{n.message}</p>
                <div className="mt-1 text-xs text-gray-500">{n.type}</div>
              </Card>
            ))
          ) : (
            <p className="text-gray-600">Aucune notification.</p>
          )}
        </div>
      </Modal>

      {/* Preferences Modal */}
      <Modal
        isOpen={showPrefs}
        onClose={() => setShowPrefs(false)}
        title="Préférences"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Mode sombre</p>
              <p className="text-sm text-gray-600">Basculer l'apparence du site</p>
            </div>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Notifications email</p>
              <p className="text-sm text-gray-600">Recevoir un email pour les alertes importantes</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={(e) => setEmailNotif(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  toast.success('Préférences enregistrées');
                  setShowPrefs(false);
                }}
              >
                Enregistrer
              </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
