import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { assignmentService, classService } from '../../services/api.service';
import { Modal } from '../UI/Modal';
import { messageService, userService } from '../../services/api.service';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface Stats {
  total_assignments: number;
  assigned_students: number;
  active_maitres: number;
  active_tuteurs: number;
  without_maitre: number;
  without_tuteur: number;
  total_classes?: number;
  total_users?: number;
  unassigned_students?: number;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(['ALL']);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [assignmentStats, classesResponse, unassignedStudents] = await Promise.all([
        assignmentService.getAssignmentStats(),
        classService.getMyClasses(),
        assignmentService.getUnassignedStudents()
      ]);

      setStats({
        ...assignmentStats,
        total_classes: Array.isArray(classesResponse) ? classesResponse.length : 0,
        unassigned_students: unassignedStudents.length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chargement des statistiques...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="bg-red-50 border-red-200">
        <p className="text-red-600">{error || 'Erreur lors du chargement'}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">👨‍💼</span>
          <div>
            <h2 className="text-2xl font-bold">Tableau de Bord Administrateur</h2>
            <p className="opacity-90 mt-1">Vue d'ensemble de la plateforme EquiLibre</p>
          </div>
        </div>
      </Card>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Total Assignations</p>
              <p className="text-3xl font-bold mt-2">{stats.total_assignments}</p>
            </div>
            <span className="text-3xl opacity-75"> </span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Étudiants Assignés</p>
              <p className="text-3xl font-bold mt-2">{stats.assigned_students}</p>
            </div>
            <span className="text-3xl opacity-75">👨‍🎓</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Maîtres Actifs</p>
              <p className="text-3xl font-bold mt-2">{stats.active_maitres}</p>
            </div>
            <span className="text-3xl opacity-75">👔</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Tuteurs Actifs</p>
              <p className="text-3xl font-bold mt-2">{stats.active_tuteurs}</p>
            </div>
            <span className="text-3xl opacity-75">🎓</span>
          </div>
        </Card>
      </div>

      {/* Alerts & Warnings */}
      {(stats.unassigned_students > 0 || stats.without_maitre > 0 || stats.without_tuteur > 0) && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Alertes & Actions Requises</h3>

          {stats.unassigned_students > 0 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl"> </span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Étudiants Non Assignés</h4>
                    <p className="text-sm text-gray-600">
                      {stats.unassigned_students} étudiant(s) n'ont pas d'assignation
                    </p>
                  </div>
                </div>
                <Link to="/admin/assignments">
                  <Button size="sm">Gérer</Button>
                </Link>
              </div>
            </Card>
          )}

          {stats.without_maitre > 0 && (
            <Card className="bg-orange-50 border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sans Maître d'Apprentissage</h4>
                    <p className="text-sm text-gray-600">
                      {stats.without_maitre} assignation(s) sans maître
                    </p>
                  </div>
                </div>
                <Link to="/admin/assignments">
                  <Button size="sm">Corriger</Button>
                </Link>
              </div>
            </Card>
          )}

          {stats.without_tuteur > 0 && (
            <Card className="bg-red-50 border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">❗</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sans Tuteur d'École</h4>
                    <p className="text-sm text-gray-600">
                      {stats.without_tuteur} assignation(s) sans tuteur
                    </p>
                  </div>
                </div>
                <Link to="/admin/assignments">
                  <Button size="sm">Corriger</Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/admin/classes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏫</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gérer les Classes</h3>
                <p className="text-sm text-gray-600">
                  {stats.total_classes} classe(s) actuelle(s)
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/assignments">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl"> </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gérer les Assignations</h3>
                <p className="text-sm text-gray-600">
                  {stats.total_assignments} assignation(s)
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gérer les Utilisateurs</h3>
                <p className="text-sm text-gray-600">Créer, modifier, supprimer</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/requirements">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🗂️</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gérer les Exigences</h3>
                <p className="text-sm text-gray-600">Documents et validations</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/calendar">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gérer le Calendrier</h3>
                <p className="text-sm text-gray-600">Cours, examens, événements</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/messages">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Messagerie</h3>
                <p className="text-sm text-gray-600">Communiquer avec tous</p>
              </div>
            </div>
          </Card>
        </Link>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📢</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Diffusion message</h3>
              <p className="text-sm text-gray-600">Envoyer à un groupe</p>
            </div>
            <Button size="sm" onClick={() => setShowBroadcast(true)}>
              Ouvrir
            </Button>
          </div>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations Système</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Maîtres Actifs</p>
            <p className="text-xl font-bold text-gray-900">{stats.active_maitres}</p>
          </div>
          <div>
            <p className="text-gray-600">Tuteurs Actifs</p>
            <p className="text-xl font-bold text-gray-900">{stats.active_tuteurs}</p>
          </div>
          <div>
            <p className="text-gray-600">Classes</p>
            <p className="text-xl font-bold text-gray-900">{stats.total_classes}</p>
          </div>
          <div>
            <p className="text-gray-600">Assignations</p>
            <p className="text-xl font-bold text-gray-900">{stats.total_assignments}</p>
          </div>
        </div>
      </Card>

      <BroadcastModal
        isOpen={showBroadcast}
        onClose={() => setShowBroadcast(false)}
        text={broadcastText}
        setText={setBroadcastText}
        sending={sending}
        onSend={async (audiences, content) => {
          if (!user) {
            toast.error('Utilisateur non connecté');
            return;
          }
          if (!content.trim()) {
            toast.error('Message vide');
            return;
          }
          try {
            setSending(true);
            const allUsers = await userService.getAllUsers();
            const wantedRoles: Record<string, string[]> = {
              STUDENTS: ['ALTERNANT', 'ETUDIANT_CLASSIQUE'],
              TUTORS: ['TUTEUR_ECOLE'],
              TEACHERS: ['MAITRE_APP'],
              ADMINS: ['ADMIN'],
              ALL: ['ALTERNANT', 'ETUDIANT_CLASSIQUE', 'TUTEUR_ECOLE', 'MAITRE_APP', 'ADMIN'],
            };

            const audienceRoles = audiences.includes('ALL')
              ? wantedRoles.ALL
              : audiences.flatMap((a) => wantedRoles[a] || []);

            const participantIds = allUsers
              .filter((u: any) => audienceRoles.includes(u.role))
              .map((u: any) => Number(u.id));

            const selfId = Number(user.id);
            if (!participantIds.includes(selfId)) participantIds.push(selfId);

            if (participantIds.length === 0) {
              toast.error('Aucun destinataire');
              return;
            }

            const conversation = await messageService.createConversation(participantIds);
            await messageService.sendMessage(Number(conversation.id), content.trim());
            toast.success('Message diffusé');
            setBroadcastText('');
            setShowBroadcast(false);
          } catch (err: any) {
            const message = err.response?.data?.message || 'Erreur lors de l’envoi';
            toast.error(message);
          } finally {
            setSending(false);
          }
        }}
        selectedAudiences={selectedAudiences}
        setSelectedAudiences={setSelectedAudiences}
      />
    </div>
  );
};

type BroadcastModalProps = {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  setText: (val: string) => void;
  sending: boolean;
  onSend: (audiences: string[], content: string) => void;
  selectedAudiences: string[];
  setSelectedAudiences: (val: string[]) => void;
};

const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  text,
  setText,
  sending,
  onSend,
  selectedAudiences,
  setSelectedAudiences,
}) => {
  const toggleAudience = (id: string) => {
    if (id === 'ALL') {
      setSelectedAudiences(['ALL']);
      return;
    }
    const next = selectedAudiences.includes('ALL')
      ? [id]
      : selectedAudiences.includes(id)
      ? selectedAudiences.filter((a) => a !== id)
      : [...selectedAudiences, id];
    setSelectedAudiences(next);
  };

  const audiences = [
    { id: 'ALL', label: 'Tout le monde' },
    { id: 'STUDENTS', label: 'Tous les élèves' },
    { id: 'TUTORS', label: 'Tous les tuteurs' },
    { id: 'TEACHERS', label: 'Tous les enseignants' },
    { id: 'ADMINS', label: 'Tous les admins' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Envoyer un message groupé" size="md">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Audience</p>
          <div className="grid grid-cols-2 gap-2">
            {audiences.map((a) => (
              <button
                key={a.id}
                onClick={() => toggleAudience(a.id)}
                className={`px-3 py-2 text-sm rounded border ${
                  selectedAudiences.includes(a.id)
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Votre annonce..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Annuler
          </Button>
          <Button onClick={() => onSend(selectedAudiences, text)} isLoading={sending}>
            Envoyer
          </Button>
        </div>
      </div>
    </Modal>
  );
};
