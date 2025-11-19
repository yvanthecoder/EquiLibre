import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { assignmentService, Assignment } from '../../services/api.service';

export const MaitreAppDashboard: React.FC = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [apprentices, setApprentices] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real apprentices data from API
  useEffect(() => {
    const fetchApprentices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await assignmentService.getAllAssignments();
        setApprentices(data);
      } catch (err) {
        console.error('Error fetching apprentices:', err);
        setError('Impossible de charger les données des apprentis');
      } finally {
        setLoading(false);
      }
    };

    fetchApprentices();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Mes alternants</h3>
          <p className="text-3xl font-bold mt-2">{apprentices.length}</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Documents en attente</h3>
          <p className="text-3xl font-bold mt-2">5</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Notifications</h3>
          <p className="text-3xl font-bold mt-2">{notifications?.filter(n => !n.read).length || 0}</p>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">👔</span>
          <div>
            <h3 className="font-semibold text-gray-900">Rôle Maître d'Apprentissage</h3>
            <p className="text-sm text-gray-600 mt-1">
              En tant que maître d'apprentissage, vous accompagnez vos alternants dans leur parcours professionnel.
              Vous pouvez suivre leur progression, valider leurs documents et communiquer avec l'école.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Apprentices */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Mes alternants
            </h2>
            <Button variant="ghost" size="sm">Voir tout</Button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-500 text-center py-4 text-sm">Chargement...</p>
            ) : error ? (
              <p className="text-red-500 text-center py-4 text-sm">{error}</p>
            ) : apprentices.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">
                Aucun apprenti assigné pour le moment
              </p>
            ) : (
              apprentices.map(apprentice => (
                <div key={apprentice.id} className="p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {apprentice.student_firstname} {apprentice.student_lastname}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Actif
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {apprentice.student_company && (
                      <p>Entreprise: {apprentice.student_company}</p>
                    )}
                    {apprentice.class_name && (
                      <p>Classe: {apprentice.class_name}</p>
                    )}
                    {apprentice.student_email && (
                      <p>Email: {apprentice.student_email}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      Contacter
                    </Button>
                    <Button size="sm" variant="primary" className="flex-1">
                      Voir profil
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Documents to Review */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Documents à vérifier
            </h2>
            <Button variant="ghost" size="sm">Voir tout</Button>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Rapport d'activité - Jean Dupont</h3>
                  <p className="text-sm text-gray-600 mt-1">Soumis il y a 2 jours</p>
                </div>
                <Button size="sm" variant="primary">Vérifier</Button>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Convention de stage - Marie Martin</h3>
                  <p className="text-sm text-gray-600 mt-1">Soumis il y a 3 jours</p>
                </div>
                <Button size="sm" variant="primary">Vérifier</Button>
              </div>
            </div>
            <p className="text-gray-500 text-center py-4 text-sm">
              2 documents en attente de vérification
            </p>
          </div>
        </Card>

        {/* Recent Messages */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Messages récents
            </h2>
            <Button variant="ghost" size="sm">Voir tout</Button>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-md">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  J
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Jean Dupont</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Bonjour, j'ai une question concernant le rapport...
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-center py-4 text-sm">
              Pas d'autres messages récents
            </p>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <span className="mr-2">👥</span>
              Voir tous mes alternants
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <span className="mr-2">💬</span>
              Contacter le tuteur école
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <span className="mr-2">📄</span>
              Valider un document
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <span className="mr-2"> </span>
              Voir les rapports
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <span className="mr-2">📅</span>
              Planifier un rendez-vous
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
