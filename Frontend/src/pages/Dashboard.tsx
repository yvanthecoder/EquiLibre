import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRequirements } from '../hooks/useRequirements';
import { useEvents } from '../hooks/useEvents';
import { useNotifications } from '../hooks/useNotifications';
import { useThreads } from '../hooks/useMessages';
import { Card } from '../components/UI/Card';
import { StatusBadge } from '../components/UI/StatusBadge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: requirements } = useRequirements(user?.classId);
  const { data: events } = useEvents(user?.classId);
  const { data: notifications } = useNotifications();
  const { data: threads } = useThreads();

  // Get upcoming deadlines
  const upcomingDeadlines = requirements
    ?.filter(req => new Date(req.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Get upcoming events
  const upcomingEvents = events
    ?.filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  // Get recent notifications
  const recentNotifications = notifications?.slice(0, 3);

  // Get recent messages
  const recentThreads = threads?.slice(0, 3);

  const getDashboardGreeting = (role: string) => {
    const greetings = {
      ALTERNANT: 'Bon retour sur votre espace alternant',
      ETUDIANT: 'Bienvenue sur votre espace étudiant',
      TUTEUR: 'Bienvenue sur votre espace tuteur',
      MAITRE_APP: 'Bienvenue sur votre espace maître d\'apprentissage',
      RESP_PLATEFORME: 'Tableau de bord administrateur',
    };
    return greetings[role as keyof typeof greetings] || 'Bienvenue';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getDashboardGreeting(user?.role || '')}
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de votre activité récente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Prochaines échéances
          </h2>
          <div className="space-y-3">
            {upcomingDeadlines?.length ? (
              upcomingDeadlines.map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
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
                Aucune échéance à venir
              </p>
            )}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Prochains événements
          </h2>
          <div className="space-y-3">
            {upcomingEvents?.length ? (
              upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(event.startDate), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {event.type}
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

        {/* Recent Notifications */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Notifications récentes
          </h2>
          <div className="space-y-3">
            {recentNotifications?.length ? (
              recentNotifications.map(notification => (
                <div key={notification.id} className={`p-3 rounded-md ${
                  notification.read ? 'bg-gray-50' : 'bg-blue-50'
                }`}>
                  <h3 className="font-medium text-gray-900">{notification.title}</h3>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Aucune notification récente
              </p>
            )}
          </div>
        </Card>

        {/* Recent Messages */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Messages récents
          </h2>
          <div className="space-y-3">
            {recentThreads?.length ? (
              recentThreads.map(thread => (
                <div key={thread.id} className="p-3 bg-gray-50 rounded-md">
                  <h3 className="font-medium text-gray-900">{thread.title}</h3>
                  <p className="text-sm text-gray-600">
                    {thread.participants.length} participant(s)
                  </p>
                  {thread.lastMessage && (
                    <p className="text-xs text-gray-500 mt-1">
                      Dernier message: {format(new Date(thread.updatedAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Aucun message récent
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};