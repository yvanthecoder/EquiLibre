import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRequirements } from '../../hooks/useRequirements';
import { useEvents } from '../../hooks/useEvents';
import { useNotifications } from '../../hooks/useNotifications';
import { Card } from '../UI/Card';
import { StatusBadge } from '../UI/StatusBadge';
import { Button } from '../UI/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { requirements } = useRequirements(user?.classId);
  const { events } = useEvents(user?.classId);
  const { notifications } = useNotifications();

  // Get upcoming deadlines
  const upcomingDeadlines = requirements
    ?.filter(req => new Date(req.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Get pending requirements
  const pendingRequirements = requirements?.filter(req => req.status === 'PENDING');

  // Get upcoming events
  const upcomingEvents = events
    ?.filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const isAlternant = user?.role === 'ALTERNANT';

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Exigences en attente</h3>
          <p className="text-3xl font-bold mt-2">{pendingRequirements?.length || 0}</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Prochaines échéances</h3>
          <p className="text-3xl font-bold mt-2">{upcomingDeadlines?.length || 0}</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Événements à venir</h3>
          <p className="text-3xl font-bold mt-2">{upcomingEvents?.length || 0}</p>
        </Card>
      </div>

      {isAlternant && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <span className="text-2xl"> </span>
            <div>
              <h3 className="font-semibold text-gray-900">Statut Alternance</h3>
              <p className="text-sm text-gray-600 mt-1">
                N'oubliez pas de soumettre vos documents d'alternance avant les échéances.
                Contactez votre maître d'apprentissage si vous avez des questions.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Prochaines échéances
            </h2>
            <Button variant="ghost" size="sm">Voir tout</Button>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines?.length ? (
              upcomingDeadlines.map(req => (
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
                Aucune échéance à venir
              </p>
            )}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Prochains événements
            </h2>
            <Button variant="ghost" size="sm">Voir tout</Button>
          </div>
          <div className="space-y-3">
            {upcomingEvents?.length ? (
              upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications récentes
            </h2>
            <Button variant="ghost" size="sm">Tout marquer comme lu</Button>
          </div>
          <div className="space-y-3">
            {notifications?.slice(0, 3).length ? (
              notifications.slice(0, 3).map(notification => (
                <div key={notification.id} className={`p-3 rounded-md ${
                  notification.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
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

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <span className="mr-2">📄</span>
              Soumettre un document
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <span className="mr-2">💬</span>
              Contacter mon tuteur
            </Button>
            {isAlternant && (
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">👔</span>
                Contacter mon maître d'apprentissage
              </Button>
            )}
            <Button className="w-full justify-start" variant="outline">
              <span className="mr-2"> </span>
              Voir mes cours
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
