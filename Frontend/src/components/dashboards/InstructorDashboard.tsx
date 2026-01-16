import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRequirements } from '../../hooks/useRequirements';
import { useEvents } from '../../hooks/useEvents';
import { useNotifications } from '../../hooks/useNotifications';
import { useInterviews } from '../../hooks/useInterviews';
import { useSoutenances } from '../../hooks/useSoutenances';
import { Card } from '../UI/Card';
import { StatusBadge } from '../UI/StatusBadge';
import { Button } from '../UI/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { CreateRequirementModal } from '../Requirements/CreateRequirementModal';

export const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { requirements } = useRequirements(user?.classId);
  const { events } = useEvents(user?.classId);
  const { notifications } = useNotifications();
  const { data: interviews = [] } = useInterviews();
  const { data: soutenances = [] } = useSoutenances();
  const navigate = useNavigate();
  const [showCreateRequirement, setShowCreateRequirement] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isJuryOrIntervenant = user?.role === 'JURY' || user?.role === 'INTERVENANT';

  // Get requirements with pending submissions
  const requirementsWithSubmissions = (requirements || []).filter(
    req => req.submissions && req.submissions.some(sub => sub.status === 'SUBMITTED')
  );

  // Get all submitted documents
  const submittedDocuments = (requirements || []).reduce((acc, req) => {
    const submitted = req.submissions?.filter(sub => sub.status === 'SUBMITTED') || [];
    return acc + submitted.length;
  }, 0);

  const combinedEvents = [
    ...(events || []).map((event) => ({
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      type: event.type,
    })),
    ...(interviews || []).map((interview) => ({
      id: `INT-${interview.id}`,
      title: 'Entretien semestriel',
      startDate: interview.scheduledAt,
      type: 'INTERVIEW',
    })),
    ...(soutenances || []).map((soutenance) => {
      const studentLabel =
        soutenance.studentFirstName && soutenance.studentLastName
          ? ` - ${soutenance.studentFirstName} ${soutenance.studentLastName}`
          : '';
      return {
        id: `SOUT-${soutenance.id}`,
        title: `${soutenance.title || 'Soutenance'}${studentLabel}`,
        startDate: soutenance.scheduledAt,
        type: 'SOUTENANCE',
      };
    }),
  ];

  const upcomingEvents = combinedEvents
    .filter((event) => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const topRequirements = (requirements || []).slice(0, 5);

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      COURSE: 'Cours',
      EXAM: 'Examen',
      DEADLINE: 'Échéance',
      MEETING: 'Réunion',
      INTERVIEW: 'Entretien',
      SOUTENANCE: 'Soutenance',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {!isJuryOrIntervenant && (
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <h3 className="text-sm font-medium opacity-90">Documents à valider</h3>
            <p className="text-3xl font-bold mt-2">{submittedDocuments}</p>
          </Card>
        )}

        {!isJuryOrIntervenant && (
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="text-sm font-medium opacity-90">Exigences actives</h3>
            <p className="text-3xl font-bold mt-2">{requirements?.length || 0}</p>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Événements à venir</h3>
          <p className="text-3xl font-bold mt-2">{upcomingEvents?.length || 0}</p>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Notifications</h3>
          <p className="text-3xl font-bold mt-2">{notifications?.filter(n => !n.read).length || 0}</p>
        </Card>
      </div>

      {isAdmin && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">👑</span>
            <div>
              <h3 className="font-semibold text-gray-900">Accès Administrateur</h3>
              <p className="text-sm text-gray-600 mt-1">
                Vous avez accès à toutes les fonctionnalités de gestion de la plateforme.
                Vous pouvez créer et gérer des classes, des utilisateurs et des exigences.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents to Validate */}
        {!isJuryOrIntervenant && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Documents à valider
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/requirements')}>
                Voir tout
              </Button>
            </div>
            <div className="space-y-3">
              {requirementsWithSubmissions.length ? (
                requirementsWithSubmissions.slice(0, 5).map(req => {
                  const pendingSubmissions = req.submissions?.filter(sub => sub.status === 'SUBMITTED').length || 0;
                  return (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{req.title}</h3>
                        <p className="text-sm text-gray-600">
                          {pendingSubmissions} soumission{pendingSubmissions > 1 ? 's' : ''} en attente
                        </p>
                      </div>
                      <Button size="sm" variant="primary">Vérifier</Button>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aucun document à valider
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Upcoming Events */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Prochains événements
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')}>
              Gérer
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingEvents?.length ? (
              upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    const dateParam = format(new Date(event.startDate), 'yyyy-MM-dd');
                    navigate(`/calendar?date=${dateParam}&eventId=${event.id}`);
                  }}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(event.startDate), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {getEventTypeLabel(event.type)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Aucun événement à venir
              </p>
            )}
          </div>
        </Card>

        {/* Active Requirements */}
        {!isJuryOrIntervenant && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Exigences actives
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateRequirement(true)}>
                Créer
              </Button>
            </div>
            <div className="space-y-3">
              {topRequirements.length ? (
                topRequirements.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{req.title}</h3>
                      <p className="text-sm text-gray-600">
                        Échéance: {format(new Date(req.dueDate), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aucune exigence active
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="space-y-2">
            {!isJuryOrIntervenant && (
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => setShowCreateRequirement(true)}
              >
                <span className="mr-2">➕</span>
                Créer une exigence
              </Button>
            )}
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/calendar')}
            >
              <span className="mr-2">📅</span>
              Créer un événement
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                if (user?.classId) {
                  navigate(`/class/${user.classId}/members`);
                } else {
                  navigate('/classes');
                }
              }}
            >
              <span className="mr-2">👥</span>
              Voir mes étudiants
            </Button>
            {isAdmin && (
              <>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/admin/classes')}
                >
                  <span className="mr-2">🏫</span>
                  Gérer les classes
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/admin/users')}
                >
                  <span className="mr-2">⚙️</span>
                  Paramètres système
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      {!isJuryOrIntervenant && (
        <CreateRequirementModal
          isOpen={showCreateRequirement}
          onClose={() => setShowCreateRequirement(false)}
          classId={user?.classId}
        />
      )}
    </div>
  );
};
